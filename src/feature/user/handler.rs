use axum::{Json, extract::State};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

use crate::{
    feature::{auth::AuthUser, user::model::UpdateUser},
    infrastructure::web::response::{ApiError, ApiResult, ApiSuccess, codes::generic},
    state::AppState,
};

/// Public user profile (no sensitive fields)
#[derive(Debug, Serialize)]
pub struct UserProfileResponse {
    pub id: Uuid,
    pub email: String,
    pub name: String,
}

/// Update profile request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateProfileRequest {
    #[validate(length(min = 3, message = "Name must be at least 3 characters"))]
    pub name: Option<String>,
}

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

    Ok(ApiSuccess::default().with_data(UserProfileResponse {
        id: user.id,
        email: user.email,
        name: user.name,
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

    let payload = UpdateUser { name: req.name };

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

    Ok(ApiSuccess::default()
        .with_data(UserProfileResponse {
            id: user.id,
            email: user.email,
            name: user.name,
        })
        .with_message("Profile updated"))
}
