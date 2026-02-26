use std::sync::Arc;

use crate::{
    feature::{
        auth::{
            repository::AuthError,
            types::{AuthResponse, LoginCredentials, TokenResponse, UserResponse},
            utils::{create_cleared_cookie, create_refresh_cookie, create_token_pair, extract_user_id, validate_refresh_token},
        },
        user::{CreateUser, repository::UserRepository},
    },
    infrastructure::{config::Config, persistence::Database},
};
use axum_extra::extract::cookie::Cookie;

/// Auth service with JWT
#[derive(Clone)]
pub struct AuthService {
    db: Database,
    user_repo: Arc<dyn UserRepository>,
    config: Arc<Config>,
}

impl AuthService {
    pub fn new(db: Database, user_repo: Arc<dyn UserRepository>, config: Arc<Config>) -> Self {
        Self {
            db,
            user_repo,
            config,
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
        let parsed_hash = PasswordHash::new(&user.password_hash)
            .map_err(|_| AuthError::HashError)?;
        
        Argon2::default()
            .verify_password(creds.password.as_bytes(), &parsed_hash)
            .map_err(|_| AuthError::InvalidCredentials)?;

        let roles = vec![user.role()];
        let tokens = create_token_pair(user.id, &user.email, &roles)
            .map_err(|_| AuthError::HashError)?;

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
    /// TODO: Implement refresh token blacklist for one-time use
    /// Currently, old refresh token remains valid until expiration (7 days)
    /// This is acceptable for most apps, but for higher security:
    /// 1. Inject session_blacklist into AuthService
    /// 2. Blacklist old refresh token jti after validation
    /// 3. Return new token pair
    pub async fn refresh_token(
        &self,
        refresh_token: &str,
    ) -> Result<(TokenResponse, Cookie<'static>), AuthError> {
        let claims = validate_refresh_token(refresh_token)
            .map_err(|_| AuthError::InvalidCredentials)?;

        let user_id = extract_user_id(&claims).map_err(|_| AuthError::InvalidCredentials)?;

        let user = self
            .user_repo
            .find_by_id(self.db.pool(), user_id)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;

        // Re-read role from DB so role changes take effect at next refresh
        let roles = vec![user.role()];
        let tokens = create_token_pair(user.id, &user.email, &roles)
            .map_err(|_| AuthError::HashError)?;

        let refresh_cookie = create_refresh_cookie(&tokens.refresh_token, &self.config);

        Ok((
            TokenResponse {
                access_token: tokens.access_token,
                expires_in: tokens.expires_in,
            },
            refresh_cookie,
        ))
    }

    /// Logout — clears refresh token cookie
    /// Note: JWT access tokens are stateless, they expire naturally
    pub fn logout(&self) -> Cookie<'static> {
        create_cleared_cookie(&self.config)
    }
}
