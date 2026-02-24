use std::env;

use eyre::{Result, WrapErr};

fn require_env(key: &str) -> Result<String> {
    env::var(key).wrap_err_with(|| format!("Missing required environment variable: {key}"))
}

fn get_rust_env() -> Result<String> {
    let rust_env = require_env("RUST_ENV")?;
    if cfg!(debug_assertions) && rust_env == "production" {
        eyre::bail!("RUST_ENV cannot be 'production' in debug mode");
    } else if !cfg!(debug_assertions) && rust_env != "production" {
        eyre::bail!("RUST_ENV must be 'production' in release mode");
    } else {
        Ok(rust_env)
    }
}

#[derive(Debug, Clone)]
pub struct ServerConfig {
    pub port: u16,
    pub cors_allowed_origins: Vec<String>,
}

impl ServerConfig {
    fn from_env() -> Self {
        let port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .unwrap_or(8080);

        let cors_allowed_origins = env::var("CORS_ALLOWED_ORIGINS")
            .unwrap_or_else(|_| "*".to_string())
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();

        Self {
            port,
            cors_allowed_origins,
        }
    }
}

#[derive(Debug, Clone)]
pub struct DatabaseConfig {
    pub url: String,
    pub max_connections: u32,
    pub min_connections: u32,
}

impl DatabaseConfig {
    fn from_env() -> Result<Self> {
        let url = require_env("DATABASE_URL")?;
        let max_connections = env::var("DB_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "10".to_string())
            .parse()
            .wrap_err("DB_MAX_CONNECTIONS must be a valid number")?;
        let min_connections = env::var("DB_MIN_CONNECTIONS")
            .unwrap_or_else(|_| "1".to_string())
            .parse()
            .wrap_err("DB_MIN_CONNECTIONS must be a valid number")?;

        Ok(Self {
            url,
            max_connections,
            min_connections,
        })
    }
}

#[derive(Debug, Clone)]
pub struct Config {
    pub rust_env: String,
    pub is_production: bool,
    pub server: ServerConfig,
    pub database: DatabaseConfig,
}

impl Config {
    pub fn load() -> Result<Self> {
        let rust_env = get_rust_env()?;
        let is_production = rust_env == "production";

        // Validate required JWT secrets at startup (fail fast)
        require_env("JWT_ACCESS_SECRET")?;
        require_env("JWT_REFRESH_SECRET")?;

        Ok(Self {
            rust_env,
            is_production,
            server: ServerConfig::from_env(),
            database: DatabaseConfig::from_env()?,
        })
    }
}
