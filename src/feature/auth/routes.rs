use axum::{Router, routing::post};

use crate::{feature::auth::handlers, state::AppState};

pub fn auth_routes() -> Router<AppState> {
    Router::new()
        .route("/register", post(handlers::register))
        .route("/login", post(handlers::login))
        .route("/refresh", post(handlers::refresh))
}
