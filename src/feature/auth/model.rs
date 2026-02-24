use serde::Deserialize;

// User entity and DTOs live in feature/user/model.rs
// This file only contains auth-specific request models.

/// Login credentials
#[derive(Debug, Deserialize)]
pub struct LoginCredentials {
    pub email: String,
    pub password: String,
}
