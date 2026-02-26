use std::sync::Arc;

use axum_extra::extract::cookie::Cookie;

use crate::{
    feature::{
        auth::{
            repository::AuthError,
            types::{AuthResponse, LoginCredentials, TokenResponse, UserResponse},
            utils::{
                create_cleared_cookie, create_refresh_cookie, create_token_pair, extract_user_id,
                validate_refresh_token,
            },
        },
        user::{CreateUser, repository::UserRepository},
    },
    infrastructure::{
        config::Config,
        persistence::{Database, redis_trait::SessionBlacklist},
    },
};

/// Auth service with JWT
#[derive(Clone)]
pub struct AuthService {
    db: Database,
    user_repo: Arc<dyn UserRepository>,
    config: Arc<Config>,
    session_blacklist: Option<Arc<dyn SessionBlacklist>>,
}

impl AuthService {
    pub fn new(
        db: Database,
        user_repo: Arc<dyn UserRepository>,
        config: Arc<Config>,
        session_blacklist: Option<Arc<dyn SessionBlacklist>>,
    ) -> Self {
        Self {
            db,
            user_repo,
            config,
            session_blacklist,
        }
    }

    /// Register new user
    pub async fn register(
        &self,
        user: CreateUser,
    ) -> Result<(AuthResponse, Cookie<'static>), AuthError> {
        // Hash password and create user
        let created_user = self.user_repo.create(self.db.pool(), &user).await?;

        // Generate tokens
        let roles = vec![created_user.role()];
        let tokens = create_token_pair(created_user.id, &created_user.email, &roles)
            .map_err(|_| AuthError::HashError)?;

        let refresh_cookie = create_refresh_cookie(&tokens.refresh_token, &self.config);

        let role = created_user.role().to_string();

        let response = AuthResponse {
            user: UserResponse {
                id: created_user.id,
                email: created_user.email,
                username: created_user.username,
                name: created_user.name,
                avatar_url: created_user.avatar_url,
                role,
            },
            token: TokenResponse {
                access_token: tokens.access_token,
                expires_in: tokens.expires_in,
            },
        };

        Ok((response, refresh_cookie))
    }

    /// Login user
    pub async fn login(
        &self,
        creds: LoginCredentials,
    ) -> Result<(AuthResponse, Cookie<'static>), AuthError> {
        let user = self
            .user_repo
            .find_by_email(self.db.pool(), &creds.email)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;

        // Verify password
        use argon2::{Argon2, PasswordHash, PasswordVerifier};
        let parsed_hash =
            PasswordHash::new(&user.password_hash).map_err(|_| AuthError::HashError)?;

        Argon2::default()
            .verify_password(creds.password.as_bytes(), &parsed_hash)
            .map_err(|_| AuthError::InvalidCredentials)?;

        let roles = vec![user.role()];
        let tokens =
            create_token_pair(user.id, &user.email, &roles).map_err(|_| AuthError::HashError)?;

        let refresh_cookie = create_refresh_cookie(&tokens.refresh_token, &self.config);

        let role = user.role().to_string();

        let response = AuthResponse {
            user: UserResponse {
                id: user.id,
                email: user.email,
                username: user.username,
                name: user.name,
                avatar_url: user.avatar_url,
                role,
            },
            token: TokenResponse {
                access_token: tokens.access_token,
                expires_in: tokens.expires_in,
            },
        };

        Ok((response, refresh_cookie))
    }

    /// Refresh access token with rotation
    ///
    /// Security features:
    /// 1. Validates the refresh token signature and expiry
    /// 2. Checks if token is blacklisted (if Redis is available)
    /// 3. Blacklists the old refresh token (one-time use)
    /// 4. Generates new token pair (rotation)
    pub async fn refresh_token(
        &self,
        refresh_token: &str,
    ) -> Result<(TokenResponse, Cookie<'static>), AuthError> {
        let claims =
            validate_refresh_token(refresh_token).map_err(|_| AuthError::InvalidCredentials)?;

        let user_id = extract_user_id(&claims).map_err(|_| AuthError::InvalidCredentials)?;

        // Check if token is blacklisted (if Redis available)
        if let Some(ref blacklist) = self.session_blacklist {
            let is_blacklisted = blacklist
                .is_blacklisted(&claims.jti)
                .await
                .map_err(|_| AuthError::InvalidCredentials)?;

            if is_blacklisted {
                tracing::warn!(
                    "Attempted to use blacklisted refresh token - possible token reuse attack"
                );
                return Err(AuthError::InvalidCredentials);
            }
        }

        let user = self
            .user_repo
            .find_by_id(self.db.pool(), user_id)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;

        // Blacklist the old refresh token (one-time use)
        if let Some(ref blacklist) = self.session_blacklist {
            let expires_at = claims.exp as i64;
            if let Err(e) = blacklist.blacklist_session(&claims.jti, expires_at).await {
                tracing::error!("Failed to blacklist refresh token: {}", e);
                // Continue anyway - better UX than failing the refresh
                // But log for monitoring
            }
        }

        // Re-read role from DB so role changes take effect at next refresh
        let roles = vec![user.role()];
        let tokens =
            create_token_pair(user.id, &user.email, &roles).map_err(|_| AuthError::HashError)?;

        let refresh_cookie = create_refresh_cookie(&tokens.refresh_token, &self.config);

        tracing::debug!("Refresh token rotated for user: {}", user_id);

        Ok((
            TokenResponse {
                access_token: tokens.access_token,
                expires_in: tokens.expires_in,
            },
            refresh_cookie,
        ))
    }

    /// Logout — clears refresh token cookie and blacklists both tokens
    ///
    /// Blacklists both access token and refresh token (if Redis available).
    /// This provides immediate logout even before token expiry.
    pub async fn logout(
        &self,
        refresh_token: Option<&str>,
        access_token: Option<&str>,
    ) -> Cookie<'static> {
        // Blacklist the refresh token if provided
        if let (Some(token), Some(blacklist)) = (refresh_token, self.session_blacklist.as_ref()) {
            if let Ok(claims) = validate_refresh_token(token) {
                let expires_at = claims.exp as i64;
                if let Err(e) = blacklist.blacklist_session(&claims.jti, expires_at).await {
                    tracing::error!("Failed to blacklist refresh token during logout: {}", e);
                } else {
                    tracing::debug!(
                        "Refresh token blacklisted during logout for jti: {}",
                        claims.jti
                    );
                }
            }
        }

        // Blacklist the access token if provided
        if let (Some(token), Some(blacklist)) = (access_token, self.session_blacklist.as_ref()) {
            if let Ok(claims) = crate::feature::auth::utils::validate_access_token(token) {
                let expires_at = claims.exp as i64;
                if let Err(e) = blacklist.blacklist_session(&claims.jti, expires_at).await {
                    tracing::error!("Failed to blacklist access token during logout: {}", e);
                } else {
                    tracing::debug!(
                        "Access token blacklisted during logout for jti: {}",
                        claims.jti
                    );
                }
            }
        }

        create_cleared_cookie(&self.config)
    }
}
