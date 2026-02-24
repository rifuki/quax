use axum::{
    Router, middleware,
    routing::{get, patch},
};

use crate::{infrastructure::web::middleware::auth_middleware, state::AppState};

use super::handler;

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/me", get(handler::get_me))
        .route("/me", patch(handler::update_me))
        .route_layer(middleware::from_fn(auth_middleware))
}
