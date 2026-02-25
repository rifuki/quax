use axum::{Router, middleware, routing::{get, post}};

use crate::{
    infrastructure::web::middleware::{admin_middleware, auth_middleware},
    state::AppState,
};

use super::handler;

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/log/level", post(handler::set_log_level))
        .route("/users", get(handler::list_users))
        .route("/users/{id}/role", post(handler::update_user_role))
        .route("/stats", get(handler::get_dashboard_stats))
        .route_layer(middleware::from_fn(admin_middleware))
        .route_layer(middleware::from_fn(auth_middleware))
}
