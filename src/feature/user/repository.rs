use async_trait::async_trait;
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::feature::user::model::{CreateUser, UpdateUser, User};

/// User repository errors (data-layer, not auth-layer)
#[derive(Debug, thiserror::Error)]
pub enum UserRepositoryError {
    #[error("Email already exists")]
    EmailExists,

    #[error("Password hashing failed")]
    HashError,

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
}

/// User repository trait — usable by any feature (auth, profile, admin, etc.)
#[async_trait]
pub trait UserRepository: Send + Sync {
    async fn create(
        &self,
        pool: &PgPool,
        payload: &CreateUser,
    ) -> Result<User, UserRepositoryError>;
    async fn find_by_id(&self, pool: &PgPool, id: Uuid) -> Result<Option<User>, sqlx::Error>;
    async fn find_by_email(&self, pool: &PgPool, email: &str) -> Result<Option<User>, sqlx::Error>;
    async fn list(&self, pool: &PgPool, limit: i64, offset: i64) -> Result<Vec<User>, sqlx::Error>;
    async fn update(
        &self,
        pool: &PgPool,
        id: Uuid,
        payload: &UpdateUser,
    ) -> Result<Option<User>, sqlx::Error>;
    async fn delete(&self, pool: &PgPool, id: Uuid) -> Result<bool, sqlx::Error>;
    async fn exists_by_email(&self, pool: &PgPool, email: &str) -> Result<bool, sqlx::Error>;
}

#[derive(Debug, Clone, Default)]
pub struct UserRepositoryImpl;

impl UserRepositoryImpl {
    pub fn new() -> Self {
        Self
    }

    fn hash_password(password: &str) -> Result<String, UserRepositoryError> {
        use argon2::{
            Argon2,
            password_hash::{PasswordHasher, SaltString, rand_core::OsRng},
        };
        let salt = SaltString::generate(&mut OsRng);
        Argon2::default()
            .hash_password(password.as_bytes(), &salt)
            .map(|h| h.to_string())
            .map_err(|_| UserRepositoryError::HashError)
    }
}

#[async_trait]
impl UserRepository for UserRepositoryImpl {
    async fn create(
        &self,
        pool: &PgPool,
        payload: &CreateUser,
    ) -> Result<User, UserRepositoryError> {
        let exists: bool =
            sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)")
                .bind(&payload.email)
                .fetch_one(pool)
                .await?;

        if exists {
            return Err(UserRepositoryError::EmailExists);
        }

        let password_hash = Self::hash_password(&payload.password)?;
        let user = User::new(&payload.email, &payload.name, &password_hash);

        let row = sqlx::query(
            "INSERT INTO users (id, email, name, password_hash, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, name, password_hash, role, created_at, updated_at",
        )
        .bind(user.id)
        .bind(&user.email)
        .bind(&user.name)
        .bind(&user.password_hash)
        .bind(user.created_at)
        .bind(user.updated_at)
        .fetch_one(pool)
        .await?;

        Ok(User {
            id: row.get("id"),
            email: row.get("email"),
            name: row.get("name"),
            password_hash: row.get("password_hash"),
            role: row.get("role"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        })
    }

    async fn find_by_id(&self, pool: &PgPool, id: Uuid) -> Result<Option<User>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, email, name, password_hash, role, created_at, updated_at FROM users WHERE id = $1"
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| User {
            id: r.get("id"),
            email: r.get("email"),
            name: r.get("name"),
            password_hash: r.get("password_hash"),
            role: r.get("role"),
            created_at: r.get("created_at"),
            updated_at: r.get("updated_at"),
        }))
    }

    async fn find_by_email(&self, pool: &PgPool, email: &str) -> Result<Option<User>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, email, name, password_hash, role, created_at, updated_at FROM users WHERE email = $1"
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| User {
            id: r.get("id"),
            email: r.get("email"),
            name: r.get("name"),
            password_hash: r.get("password_hash"),
            role: r.get("role"),
            created_at: r.get("created_at"),
            updated_at: r.get("updated_at"),
        }))
    }

    async fn list(&self, pool: &PgPool, limit: i64, offset: i64) -> Result<Vec<User>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, email, name, password_hash, role, created_at, updated_at
             FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2",
        )
        .bind(limit)
        .bind(offset)
        .fetch_all(pool)
        .await?;

        Ok(rows
            .into_iter()
            .map(|r| User {
                id: r.get("id"),
                email: r.get("email"),
                name: r.get("name"),
                password_hash: r.get("password_hash"),
                role: r.get("role"),
                created_at: r.get("created_at"),
                updated_at: r.get("updated_at"),
            })
            .collect())
    }

    async fn update(
        &self,
        pool: &PgPool,
        id: Uuid,
        payload: &UpdateUser,
    ) -> Result<Option<User>, sqlx::Error> {
        if payload.name.is_none() {
            return self.find_by_id(pool, id).await;
        }

        let name = payload.name.as_ref().unwrap();
        let updated_at = chrono::Utc::now();

        let row = sqlx::query(
            "UPDATE users SET name = COALESCE($1, name), updated_at = $2
             WHERE id = $3
             RETURNING id, email, name, password_hash, role, created_at, updated_at",
        )
        .bind(name)
        .bind(updated_at)
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(row.map(|r| User {
            id: r.get("id"),
            email: r.get("email"),
            name: r.get("name"),
            password_hash: r.get("password_hash"),
            role: r.get("role"),
            created_at: r.get("created_at"),
            updated_at: r.get("updated_at"),
        }))
    }

    async fn delete(&self, pool: &PgPool, id: Uuid) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM users WHERE id = $1")
            .bind(id)
            .execute(pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }

    async fn exists_by_email(&self, pool: &PgPool, email: &str) -> Result<bool, sqlx::Error> {
        let row = sqlx::query("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) as exists")
            .bind(email)
            .fetch_one(pool)
            .await?;

        Ok(row.get::<bool, _>("exists"))
    }
}
