use axum::http::{HeaderName, Method, header};
use tower_http::cors::CorsLayer;

use crate::infrastructure::config::Config;

pub fn build_cors_layer(config: &Config) -> CorsLayer {
    let allowed_origins: Vec<axum::http::HeaderValue> = config
        .server
        .cors_allowed_origins
        .iter()
        .map(|o| o.parse().expect("Invalid CORS origin in config"))
        .collect();

    CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::PATCH,
            Method::OPTIONS,
        ])
        .allow_headers([
            header::AUTHORIZATION,
            header::CONTENT_TYPE,
            HeaderName::from_static("x-csrf-token"),
            HeaderName::from_static("x-api-key"),
            HeaderName::from_static("x-request-id"),
        ])
        .allow_credentials(true)
}
