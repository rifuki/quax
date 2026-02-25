use axum::{Json, extract::State, http::StatusCode};

use crate::{
    feature::auth::{AuthResponse, service::AuthService},
    feature::user::model::CreateUser,
    infrastructure::web::response::{ApiError, ApiResult, ApiSuccess, codes::{auth, generic}},
    state::AppState,
};

/// Request body for seed endpoint
#[derive(Debug, serde::Deserialize)]
pub struct SeedRequest {
    /// API Key for authentication
    pub api_key: String,
}

/// Seed the database with dummy accounts
/// Requires valid API_KEY header (configured in .env)
/// Can be disabled by setting ENABLE_DEV_SEED=false
pub async fn seed(
    State(state): State<AppState>,
    Json(req): Json<SeedRequest>,
) -> ApiResult<Vec<AuthResponse>> {
    // Check if dev seed is enabled
    let enabled = std::env::var("ENABLE_DEV_SEED")
        .unwrap_or_else(|_| "true".to_string())
        .parse::<bool>()
        .unwrap_or(true);
    
    if !enabled {
        return Err(ApiError::default()
            .with_code(StatusCode::FORBIDDEN)
            .with_error_code(auth::FORBIDDEN)
            .with_message("Dev seed is disabled"));
    }

    // Validate API key
    let expected_key = std::env::var("DEV_API_KEY")
        .unwrap_or_else(|_| "dev-secret-key".to_string());
    
    if !constant_time_eq(req.api_key.as_bytes(), expected_key.as_bytes()) {
        return Err(ApiError::default()
            .with_code(StatusCode::UNAUTHORIZED)
            .with_error_code(auth::UNAUTHORIZED)
            .with_message("Invalid API key"));
    }

    let auth_service = AuthService::new(
        state.db.clone(),
        state.user_repo.clone(),
        state.config.clone(),
    );

    let mut created_users = Vec::new();

    // Create admin user
    let admin_user = CreateUser {
        email: "admin@quax.dev".to_string(),
        username: Some("admin".to_string()),
        name: "Administrator".to_string(),
        password: "admin123".to_string(),
    };

    if let Ok((auth_response, _)) = auth_service.register(admin_user).await {
        created_users.push(auth_response);
    }

    // Create regular user
    let regular_user = CreateUser {
        email: "user@quax.dev".to_string(),
        username: Some("johndoe".to_string()),
        name: "John Doe".to_string(),
        password: "user123".to_string(),
    };

    if let Ok((auth_response, _)) = auth_service.register(regular_user).await {
        created_users.push(auth_response);
    }

    // Create test user
    let test_user = CreateUser {
        email: "hello@mail.com".to_string(),
        username: Some("hatsunemiku".to_string()),
        name: "Hello World".to_string(),
        password: "Hatsunemiku".to_string(),
    };

    if let Ok((auth_response, _)) = auth_service.register(test_user).await {
        created_users.push(auth_response);
    }

    let count = created_users.len();
    if count == 0 {
        return Err(ApiError::default()
            .with_code(StatusCode::CONFLICT)
            .with_error_code(generic::INTERNAL)
            .with_message("All seed accounts already exist"));
    }

    Ok(ApiSuccess::default()
        .with_data(created_users)
        .with_message(format!("Created {} seed accounts", count)))
}

/// Constant-time comparison of two byte slices
fn constant_time_eq(a: &[u8], b: &[u8]) -> bool {
    if a.len() != b.len() {
        return false;
    }
    let mut result = 0u8;
    for (x, y) in a.iter().zip(b.iter()) {
        result |= x ^ y;
    }
    result == 0
}
