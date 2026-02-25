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
    pub username: Option<String>,
    pub name: String,
    pub role: String,
}

/// Update profile request
#[derive(Debug, Deserialize, Validate)]
pub struct UpdateProfileRequest {
    #[validate(length(min = 3, message = "Name must be at least 3 characters"))]
    pub name: Option<String>,
    
    #[validate(length(min = 3, max = 50, message = "Username must be between 3 and 50 characters"))]
    pub username: Option<String>,
    
    #[validate(email(message = "Invalid email format"))]
    pub email: Option<String>,
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

    let user_role = user.role().to_string();
    Ok(ApiSuccess::default().with_data(UserProfileResponse {
        id: user.id,
        email: user.email.clone(),
        username: user.username.clone(),
        name: user.name.clone(),
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
            role: user_role,
        })
        .with_message("Profile updated"))
}

/// POST /api/v1/users/avatar — upload avatar
pub async fn upload_avatar(
    State(_state): State<AppState>,
    _auth_user: axum::Extension<AuthUser>,
) -> ApiResult<serde_json::Value> {
    // TODO: Implement file upload with multipart
    // For now, return mock response
    Ok(ApiSuccess::default()
        .with_data(serde_json::json!({
            "avatar_url": "/avatars/default.png"
        }))
        .with_message("Avatar uploaded successfully"))
}
