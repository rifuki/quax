use axum::{
    Router,
    middleware,
    routing::{delete, get, patch, post},
};

use crate::{
    feature::admin::api_key_handler,
    infrastructure::web::middleware::{admin_middleware, auth_middleware},
    state::AppState,
};

pub fn api_key_routes() -> Router<AppState> {
    Router::new()
        .route("/", get(api_key_handler::list_keys))
        .route("/", post(api_key_handler::create_key))
        .route("/{id}", get(api_key_handler::get_key))
        .route("/{id}", patch(api_key_handler::update_key))
        .route("/{id}", delete(api_key_handler::delete_key))
        .route("/{id}/revoke", post(api_key_handler::revoke_key))
        .route("/{id}/refresh", post(api_key_handler::refresh_key))
        .route_layer(middleware::from_fn(admin_middleware))
        .route_layer(middleware::from_fn(auth_middleware))
}
