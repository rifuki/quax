use axum::{
    Router, middleware,
    routing::{get, patch, post, delete},
};

use crate::{infrastructure::web::middleware::auth_middleware, state::AppState};

use super::handler;

pub fn user_routes() -> Router<AppState> {
    Router::new()
        .route("/me", get(handler::get_me))
        .route("/me", patch(handler::update_me))
        .route("/avatar", post(handler::upload_avatar))
        .route("/avatar", delete(handler::delete_avatar))
        .route_layer(middleware::from_fn(auth_middleware))
}
