use axum_extra::extract::cookie::{Cookie, SameSite};

use crate::infrastructure::config::Config;

pub const REFRESH_TOKEN_COOKIE: &str = "refresh_token";
pub const REFRESH_COOKIE_PATH: &str = "/api/v1/auth";

/// Build httpOnly refresh token cookie — secure in production, Strict SameSite
pub fn create_refresh_cookie(token: &str, config: &Config) -> Cookie<'static> {
    let expiry_secs = std::env::var("JWT_REFRESH_EXPIRY_SECS")
        .ok()
        .and_then(|v| v.parse::<i64>().ok())
        .unwrap_or(604_800); // default 7 days

    Cookie::build((REFRESH_TOKEN_COOKIE, token.to_string()))
        .http_only(true)
        .secure(config.is_production)
        .same_site(SameSite::Strict)
        .path(REFRESH_COOKIE_PATH)
        .max_age(time::Duration::seconds(expiry_secs))
        .build()
}
