use axum::{Json, extract::State};
use axum::extract::Multipart;
use bytes::Bytes;
use validator::Validate;

use crate::{
    feature::{auth::AuthUser, user::dto::{UpdateProfileRequest, UpdateUser, UserProfileResponse}},
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

/// Allowed MIME types for avatar uploads
const ALLOWED_CONTENT_TYPES: &[&str] = &[
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

/// Map a MIME type to a file extension
fn extension_for(content_type: &str) -> Option<&'static str> {
    match content_type {
        "image/jpeg" => Some("jpg"),
        "image/png"  => Some("png"),
        "image/webp" => Some("webp"),
        "image/gif"  => Some("gif"),
        _ => None,
    }
}

/// POST /api/v1/users/avatar — upload avatar
pub async fn upload_avatar(
    State(state): State<AppState>,
    auth_user: axum::Extension<AuthUser>,
    mut multipart: Multipart,
) -> ApiResult<serde_json::Value> {
    let user_id = auth_user.user_id;
    let max_size = state.config.upload.max_avatar_size;

    // --- 1. Parse multipart, find the "avatar" field ---
    let mut file_data: Option<(Bytes, String)> = None; // (bytes, content_type)

    while let Some(field) = multipart.next_field().await.map_err(|e| {
        ApiError::default()
            .with_code(axum::http::StatusCode::BAD_REQUEST)
            .with_message(format!("Failed to parse multipart: {e}"))
    })? {
        if field.name() != Some("avatar") {
            continue;
        }

        // --- 2. Validate content type ---
        let content_type = field
            .content_type()
            .unwrap_or("")
            .to_string();

        if !ALLOWED_CONTENT_TYPES.contains(&content_type.as_str()) {
            return Err(ApiError::default()
                .with_code(axum::http::StatusCode::BAD_REQUEST)
                .with_message(format!(
                    "Unsupported file type '{}'. Allowed: jpeg, png, webp, gif",
                    content_type
                )));
        }

        // --- 3. Read bytes, check size ---
        let data = field.bytes().await.map_err(|e| {
            ApiError::default()
                .with_code(axum::http::StatusCode::BAD_REQUEST)
                .with_message(format!("Failed to read file data: {e}"))
        })?;

        if data.len() > max_size {
            return Err(ApiError::default()
                .with_code(axum::http::StatusCode::BAD_REQUEST)
                .with_message(format!(
                    "File too large. Maximum allowed size is {} bytes",
                    max_size
                )));
        }

        file_data = Some((data, content_type));
        break;
    }

    let (data, content_type) = file_data.ok_or_else(|| {
        ApiError::default()
            .with_code(axum::http::StatusCode::BAD_REQUEST)
            .with_message("Missing 'avatar' field in multipart form")
    })?;

    let ext = extension_for(&content_type).unwrap_or("bin");

    // --- 4. Delete old avatar if present ---
    if let Ok(Some(user)) = state.user_repo.find_by_id(state.db.pool(), user_id).await {
        if let Some(old_url) = user.avatar_url {
            // Derive the storage key from the URL: strip the base_url prefix
            let base = state.config.upload.base_url.trim_end_matches('/');
            if let Some(key) = old_url.strip_prefix(base).map(|s| s.trim_start_matches('/')) {
                let _ = state.storage.delete(key).await;
            }
        }
    }

    // --- 5. Store new avatar ---
    let key = format!("avatars/{user_id}.{ext}");
    state.storage.put(&key, data, &content_type).await.map_err(|e| {
        ApiError::default().log_only(e)
    })?;

    // --- 6. Persist the public URL ---
    let avatar_url = state.storage.public_url(&key);
    state
        .user_repo
        .update_avatar_url(state.db.pool(), user_id, &avatar_url)
        .await
        .map_err(|e| ApiError::default().log_only(e))?;

    Ok(ApiSuccess::default()
        .with_data(serde_json::json!({ "avatar_url": avatar_url }))
        .with_message("Avatar uploaded successfully"))
}
