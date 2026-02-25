use axum::{Extension, Json, extract::Path, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use tracing_subscriber::EnvFilter;
use uuid::Uuid;

use crate::{
    feature::{auth::AuthUser, user::model::User},
    infrastructure::web::response::{ApiError, ApiResult, ApiSuccess, codes::generic},
    state::AppState,
};

#[derive(Debug, Deserialize)]
pub struct SetLogLevelRequest {
    /// Log level filter string, e.g. "debug", "info", "warn", "error"
    /// Supports full tracing filter syntax: "api=debug,sqlx=warn"
    pub level: String,
}

/// POST /api/v1/admin/log/level
///
/// Dynamically change log level at runtime without restart.
/// Protected: requires valid JWT with Admin role.
pub async fn set_log_level(
    State(state): State<AppState>,
    Json(req): Json<SetLogLevelRequest>,
) -> ApiResult<serde_json::Value> {
    let new_filter = EnvFilter::try_new(&req.level).map_err(|e| {
        ApiError::default()
            .with_code(axum::http::StatusCode::BAD_REQUEST)
            .with_message(format!("Invalid log level filter: {}", e))
    })?;

    state
        .log_reload_handle
        .reload(new_filter)
        .map_err(|e| ApiError::default().log_only(format!("Failed to reload log filter: {}", e)))?;

    tracing::info!(level = %req.level, "Log level changed by admin");

    Ok(ApiSuccess::default()
        .with_data(serde_json::json!({ "level": req.level }))
        .with_message(format!("Log level set to '{}'", req.level)))
}

// ============================================================================
// User Management
// ============================================================================

/// GET /api/v1/admin/users
///
/// List all users (admin only)
pub async fn list_users(
    State(state): State<AppState>,
) -> ApiResult<Vec<UserResponse>> {
    let users: Vec<User> = sqlx::query_as(
        "SELECT id, email, username, name, password_hash, role, created_at, updated_at 
         FROM users ORDER BY created_at DESC"
    )
    .fetch_all(state.db.pool())
    .await
    .map_err(|e| ApiError::default().with_message(format!("Database error: {}", e)))?;

    let user_responses: Vec<UserResponse> = users.into_iter().map(|u| UserResponse {
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        role: u.role,
        created_at: u.created_at,
        updated_at: u.updated_at,
    }).collect();

    Ok(ApiSuccess::default()
        .with_data(user_responses)
        .with_message("Users retrieved successfully"))
}

// ============================================================================
// User Role Management
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct UpdateUserRoleRequest {
    pub role: String,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: Uuid,
    pub email: String,
    pub username: Option<String>,
    pub name: String,
    pub role: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

/// POST /api/v1/admin/users/:id/role
///
/// Update a user's role (admin only).
/// Cannot change your own role (prevents self-demotion).
pub async fn update_user_role(
    State(state): State<AppState>,
    Extension(auth_user): Extension<AuthUser>,
    Path(user_id): Path<Uuid>,
    Json(req): Json<UpdateUserRoleRequest>,
) -> ApiResult<UserResponse> {
    // Validate role
    let role = req.role.to_lowercase();
    if role != "admin" && role != "user" {
        return Err(ApiError::default()
            .with_code(StatusCode::BAD_REQUEST)
            .with_error_code(generic::INVALID_INPUT)
            .with_message("Role must be either 'admin' or 'user'"));
    }

    // Prevent changing own role
    if user_id == auth_user.user_id {
        return Err(ApiError::default()
            .with_code(StatusCode::FORBIDDEN)
            .with_error_code(generic::FORBIDDEN)
            .with_message("Cannot change your own role"));
    }

    // Update the user's role
    let user = state
        .user_repo
        .update_role(state.db.pool(), user_id, &role)
        .await
        .map_err(|e| ApiError::default().log_only(e))?
        .ok_or_else(|| {
            ApiError::default()
                .with_code(StatusCode::NOT_FOUND)
                .with_error_code(generic::NOT_FOUND)
                .with_message("User not found")
        })?;

    Ok(ApiSuccess::default()
        .with_data(UserResponse {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        })
        .with_message(format!("User role updated to '{}'", role)))
}

// ============================================================================
// Dashboard Stats
// ============================================================================

#[derive(Debug, Serialize)]
pub struct DashboardStatsResponse {
    pub total_users: i64,
    pub total_admins: i64,
    pub total_api_keys: i64,
    pub active_api_keys: i64,
    pub new_users_this_month: i64,
}

/// GET /api/v1/admin/stats
///
/// Get dashboard statistics (admin only).
pub async fn get_dashboard_stats(State(state): State<AppState>) -> ApiResult<DashboardStatsResponse> {
    let pool = state.db.pool();

    // Get total users
    let total_users: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(pool)
        .await
        .map_err(|e| ApiError::default().log_only(e))?;

    // Get total admins
    let total_admins: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        .fetch_one(pool)
        .await
        .map_err(|e| ApiError::default().log_only(e))?;

    // Get total API keys
    let total_api_keys: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM api_keys")
        .fetch_one(pool)
        .await
        .map_err(|e| ApiError::default().log_only(e))?;

    // Get active API keys (is_active = true AND (expires_at IS NULL OR expires_at > NOW()))
    let active_api_keys: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM api_keys WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW())"
    )
    .fetch_one(pool)
    .await
    .map_err(|e| ApiError::default().log_only(e))?;

    // Get new users this month
    let new_users_this_month: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM users WHERE created_at >= DATE_TRUNC('month', NOW())"
    )
    .fetch_one(pool)
    .await
    .map_err(|e| ApiError::default().log_only(e))?;

    Ok(ApiSuccess::default().with_data(DashboardStatsResponse {
        total_users,
        total_admins,
        total_api_keys,
        active_api_keys,
        new_users_this_month,
    }))
}
