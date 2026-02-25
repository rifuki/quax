use axum::{Router, routing::post};

use crate::{feature::dev::handlers, state::AppState};

pub fn dev_routes() -> Router<AppState> {
    Router::new()
        .route("/seed", post(handlers::seed))
}
