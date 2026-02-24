use axum::{Router, middleware, routing::post};

use crate::{
    infrastructure::web::middleware::{admin_middleware, auth_middleware},
    state::AppState,
};

use super::handler;

pub fn admin_routes() -> Router<AppState> {
    Router::new()
        .route("/log/level", post(handler::set_log_level))
        .route_layer(middleware::from_fn(admin_middleware))
        .route_layer(middleware::from_fn(auth_middleware))
}
