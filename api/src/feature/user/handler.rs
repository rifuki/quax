use axum::{Json, extract::State};
use validator::Validate;

use crate::{
    feature::{
        auth::AuthUser,
        user::dto::{UpdateProfileRequest, UpdateUser, UserProfileResponse},
    },
    infrastructure::web::response::{ApiError, ApiResult, ApiSuccess, codes::generic},
    state::AppState,
};

/// GET /api/v1/users/me — get current user profile
pub async fn get_me(
    State(state): State<AppState>,
    auth_user: axum::Extension<AuthUser>,
) -> ApiResult<UserProfileResponse> {
    let user = state
        .user_repo
        .find_by_id(state.db.pool(), auth_user.user_id)
        .await
        .map_err(|e| ApiError::default().log_only(e))?
        .ok_or_else(|| {
            ApiError::default()
                .with_code(axum::http::StatusCode::NOT_FOUND)
                .with_error_code(generic::NOT_FOUND)
                .with_message("User not found")
        })?;

    let user_role = user.role().to_string();
    Ok(ApiSuccess::default().with_data(UserProfileResponse {
        id: user.id,
        email: user.email.clone(),
        username: user.username.clone(),
        name: user.name.clone(),
        avatar_url: user.avatar_url.clone(),
        role: user_role,
    }))
}

/// PATCH /api/v1/users/me — update current user profile
pub async fn update_me(
    State(state): State<AppState>,
    auth_user: axum::Extension<AuthUser>,
    Json(req): Json<UpdateProfileRequest>,
) -> ApiResult<UserProfileResponse> {
    if let Err(e) = req.validate() {
        return Err(ApiError::default()
            .with_code(axum::http::StatusCode::BAD_REQUEST)
            .with_error_code(crate::infrastructure::web::response::codes::validation::INVALID_INPUT)
            .with_message(format!("Validation error: {}", e)));
    }

    let payload = UpdateUser {
        name: req.name,
        username: req.username,
        email: req.email,
    };

    let user = state
        .user_repo
        .update(state.db.pool(), auth_user.user_id, &payload)
        .await
        .map_err(|e| ApiError::default().log_only(e))?
        .ok_or_else(|| {
            ApiError::default()
                .with_code(axum::http::StatusCode::NOT_FOUND)
                .with_error_code(generic::NOT_FOUND)
                .with_message("User not found")
        })?;

    let user_role = user.role().to_string();
    Ok(ApiSuccess::default()
        .with_data(UserProfileResponse {
            id: user.id,
            email: user.email.clone(),
            username: user.username.clone(),
            name: user.name.clone(),
            avatar_url: user.avatar_url.clone(),
            role: user_role,
        })
        .with_message("Profile updated"))
}
