use axum::{Json, extract::State, http::StatusCode};
use axum_extra::extract::cookie::CookieJar;
use validator::Validate;

use crate::{
    feature::auth::{
        cookie::REFRESH_TOKEN_COOKIE,
        model::LoginCredentials,
        repository::AuthError,
        types::{AuthResponse, LoginRequest, RegisterRequest, TokenResponse},
    },
    feature::user::model::CreateUser,
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
        .with_cookie(refresh_cookie)
        .with_data(response)
        .with_message("User registered successfully"))
}

/// POST /api/v1/auth/login
pub async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> ApiResult<AuthResponse> {
    if let Err(e) = req.validate() {
        return Err(ApiError::default()
            .with_code(StatusCode::BAD_REQUEST)
            .with_error_code(val_codes::INVALID_INPUT)
            .with_message(format!("Validation error: {}", e)));
    }

    let credentials = LoginCredentials {
        email: req.email,
        password: req.password,
    };

    let (response, refresh_cookie) =
        state
            .auth_service
            .login(credentials)
            .await
            .map_err(|_: AuthError| {
                ApiError::default()
                    .with_code(StatusCode::UNAUTHORIZED)
                    .with_error_code(auth_codes::INVALID_CREDENTIALS)
                    .with_message("Invalid credentials")
            })?;

    Ok(ApiSuccess::default()
        .with_cookie(refresh_cookie)
        .with_data(response)
        .with_message("Login successful"))
}

/// POST /api/v1/auth/refresh
///
/// Reads refresh token from httpOnly cookie, returns new access token + rotates refresh cookie
pub async fn refresh(jar: CookieJar, State(state): State<AppState>) -> ApiResult<TokenResponse> {
    let refresh_token = jar
        .get(REFRESH_TOKEN_COOKIE)
        .map(|c| c.value().to_string())
        .ok_or_else(|| {
            ApiError::default()
                .with_code(StatusCode::UNAUTHORIZED)
                .with_error_code(auth_codes::TOKEN_INVALID)
                .with_message("Missing refresh token")
        })?;

    let (tokens, refresh_cookie) = state
        .auth_service
        .refresh_token(&refresh_token)
        .await
        .map_err(|_: AuthError| {
            ApiError::default()
                .with_code(StatusCode::UNAUTHORIZED)
                .with_error_code(auth_codes::TOKEN_INVALID)
                .with_message("Invalid refresh token")
        })?;

    Ok(ApiSuccess::default()
        .with_cookie(refresh_cookie)
        .with_data(tokens)
        .with_message("Token refreshed"))
}
