use axum::{Json, extract::State, http::StatusCode, Extension};
use axum_extra::extract::cookie::CookieJar;
use validator::Validate;

use crate::{
    feature::auth::{
        repository::AuthError,
        types::{AuthResponse, AuthUser, LoginCredentials, RegisterRequest, TokenResponse, UserResponse},
        utils::REFRESH_TOKEN_COOKIE,
    },
    feature::user::CreateUser,
    infrastructure::web::response::{
        ApiError, ApiResult, ApiSuccess,
        codes::{auth as auth_codes, validation as val_codes},
    },
    state::AppState,
};

/// POST /api/v1/auth/register
pub async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> ApiResult<AuthResponse> {
    if let Err(e) = req.validate() {
        return Err(ApiError::default()
            .with_code(StatusCode::BAD_REQUEST)
            .with_error_code(val_codes::INVALID_INPUT)
            .with_message(format!("Validation error: {}", e)));
    }

    let create_user = CreateUser {
        email: req.email,
        username: req.username,
        name: req.name,
        password: req.password,
    };

    let (response, refresh_cookie) =
        state
            .auth_service
            .register(create_user)
            .await
            .map_err(|e: AuthError| {
                ApiError::default()
                    .with_code(StatusCode::BAD_REQUEST)
                    .with_error_code(auth_codes::EMAIL_EXISTS)
                    .with_message(e.to_string())
            })?;

    Ok(ApiSuccess::default()
        .with_code(StatusCode::CREATED)
        .with_data(response)
        .with_cookie(refresh_cookie)
        .with_message("Registration successful"))
}

/// POST /api/v1/auth/login
pub async fn login(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(creds): Json<LoginCredentials>,
) -> ApiResult<AuthResponse> {
    // Check existing refresh token to avoid concurrent login issues
    if let Some(_cookie) = jar.get(REFRESH_TOKEN_COOKIE) {
        // Clear existing cookie - login will generate a new token
        let _ = state.auth_service.logout();
    }

    let (response, refresh_cookie) = state
        .auth_service
        .login(creds)
        .await
        .map_err(|e: AuthError| match e {
            AuthError::InvalidCredentials => ApiError::default()
                .with_code(StatusCode::UNAUTHORIZED)
                .with_error_code(auth_codes::INVALID_CREDENTIALS)
                .with_message("Invalid email or password"),
            _ => ApiError::default()
                .with_code(StatusCode::INTERNAL_SERVER_ERROR)
                .with_error_code(auth_codes::INTERNAL_ERROR)
                .with_message("Login failed"),
        })?;

    Ok(ApiSuccess::default()
        .with_data(response)
        .with_cookie(refresh_cookie)
        .with_message("Login successful"))
}

/// POST /api/v1/auth/refresh
pub async fn refresh(
    State(state): State<AppState>,
    jar: CookieJar,
) -> ApiResult<TokenResponse> {
    let refresh_token = jar
        .get(REFRESH_TOKEN_COOKIE)
        .ok_or_else(|| {
            ApiError::default()
                .with_code(StatusCode::UNAUTHORIZED)
                .with_error_code(auth_codes::UNAUTHORIZED)
                .with_message("Refresh token not found")
        })?
        .value();

    let (access_token, new_refresh_cookie) = state
        .auth_service
        .refresh_token(refresh_token)
        .await
        .map_err(|e: AuthError| match e {
            AuthError::InvalidCredentials => ApiError::default()
                .with_code(StatusCode::UNAUTHORIZED)
                .with_error_code(auth_codes::TOKEN_EXPIRED)
                .with_message("Refresh token expired"),
            _ => ApiError::default()
                .with_code(StatusCode::UNAUTHORIZED)
                .with_error_code(auth_codes::TOKEN_INVALID)
                .with_message("Invalid refresh token"),
        })?;

    Ok(ApiSuccess::default()
        .with_data(access_token)
        .with_cookie(new_refresh_cookie)
        .with_message("Token refreshed"))
}

/// POST /api/v1/auth/logout
pub async fn logout(
    State(state): State<AppState>,
    jar: CookieJar,
) -> ApiResult<()> {
    let _ = jar.get(REFRESH_TOKEN_COOKIE);

    let clear_cookie = crate::feature::auth::utils::cookie::create_cleared_cookie(&state.config);

    Ok(ApiSuccess::default()
        .with_cookie(clear_cookie)
        .with_message("Logout successful"))
}

/// GET /api/v1/auth/me
pub async fn me(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
) -> ApiResult<UserResponse> {
    let user = state
        .user_repo
        .find_by_id(state.db.pool(), auth_user.user_id)
        .await
        .map_err(|_| {
            ApiError::default()
                .with_code(StatusCode::INTERNAL_SERVER_ERROR)
                .with_error_code(auth_codes::INTERNAL_ERROR)
                .with_message("Failed to fetch user")
        })?
        .ok_or_else(|| {
            ApiError::default()
                .with_code(StatusCode::NOT_FOUND)
                .with_error_code(auth_codes::USER_NOT_FOUND)
                .with_message("User not found")
        })?;
    
    let user_role = user.role().to_string();
    let response = UserResponse {
        id: user.id,
        email: user.email.clone(),
        username: user.username.clone(),
        name: user.name.clone(),
        avatar_url: user.avatar_url.clone(),
        role: user_role,
    };
    
    Ok(ApiSuccess::default()
        .with_data(response)
        .with_message("User info retrieved"))
}
