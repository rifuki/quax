use axum::{Router, middleware, routing::{get, post, delete}};

use crate::{feature::auth::handlers, infrastructure::web::middleware::auth_middleware, state::AppState};

pub fn auth_routes() -> Router<AppState> {
    // Public routes (no auth required)
    let public = Router::new()
        .route("/register", post(handlers::register))
        .route("/login", post(handlers::login))
        .route("/refresh", post(handlers::refresh));
    
    // Protected routes (auth required)
    let protected = Router::new()
        .route("/logout", post(handlers::logout))
        .route("/me", get(handlers::me))
        .route("/change-password", post(handlers::change_password))
        .route("/sessions", get(handlers::list_sessions).delete(handlers::logout_all_sessions))
        .route("/sessions/{id}", delete(handlers::revoke_session))
        .route_layer(middleware::from_fn(auth_middleware));
    
    public.merge(protected)
}
