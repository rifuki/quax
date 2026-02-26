use axum::{Extension, Json, extract::State, http::StatusCode};
use validator::Validate;

use crate::{
    feature::auth::types::{AuthUser, ChangePasswordRequest, hash_password},
    infrastructure::web::response::{
        ApiError, ApiResult, ApiSuccess,
        codes::{auth as auth_codes, validation as val_codes},
    },
    state::AppState,
};

/// POST /api/v1/auth/change-password
pub async fn change_password(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Json(req): Json<ChangePasswordRequest>,
) -> ApiResult<()> {
    // Validate request
    if let Err(e) = req.validate() {
        return Err(ApiError::default()
            .with_code(StatusCode::BAD_REQUEST)
            .with_error_code(val_codes::INVALID_INPUT)
            .with_message(format!("Validation error: {}", e)));
    }

    // Validate new password length
    if req.new_password.len() < 8 {
        return Err(ApiError::default()
            .with_code(StatusCode::BAD_REQUEST)
            .with_error_code(val_codes::INVALID_INPUT)
            .with_message("New password must be at least 8 characters"));
    }

    // Get user from database
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

    // Verify current password
    use argon2::{Argon2, PasswordHash, PasswordVerifier};
    let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|_| {
        ApiError::default()
            .with_code(StatusCode::INTERNAL_SERVER_ERROR)
            .with_error_code(auth_codes::INTERNAL_ERROR)
            .with_message("Invalid password hash")
    })?;

    Argon2::default()
        .verify_password(req.current_password.as_bytes(), &parsed_hash)
        .map_err(|_| {
            ApiError::default()
                .with_code(StatusCode::UNAUTHORIZED)
                .with_error_code(auth_codes::INVALID_CREDENTIALS)
                .with_message("Current password is incorrect")
        })?;

    // Hash new password
    let new_password_hash = hash_password(&req.new_password).map_err(|_| {
        ApiError::default()
            .with_code(StatusCode::INTERNAL_SERVER_ERROR)
            .with_error_code(auth_codes::INTERNAL_ERROR)
            .with_message("Failed to hash password")
    })?;

    // Update password in database
    state
        .user_repo
        .update_password(state.db.pool(), auth_user.user_id, &new_password_hash)
        .await
        .map_err(|_| {
            ApiError::default()
                .with_code(StatusCode::INTERNAL_SERVER_ERROR)
                .with_error_code(auth_codes::INTERNAL_ERROR)
                .with_message("Failed to update password")
        })?;

    Ok(ApiSuccess::default().with_message("Password changed successfully"))
}
