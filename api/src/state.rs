use std::sync::Arc;

use eyre::WrapErr;

use crate::{
    feature::{
        auth::service::AuthService,
        user::repository::{UserRepository, UserRepositoryImpl},
    },
    infrastructure::{
        config::Config,
        logging::ReloadFilterHandle,
        persistence::Database,
        storage::StorageProvider,
    },
};

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: Database,
    pub auth_service: Arc<AuthService>,
    pub user_repo: Arc<dyn UserRepository>,
    pub storage: Arc<dyn StorageProvider>,
    pub log_reload_handle: Arc<ReloadFilterHandle>,
}

impl std::fmt::Debug for AppState {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("AppState")
            .field("config", &self.config)
            .finish_non_exhaustive()
    }
}

impl AppState {
    pub fn port(&self) -> u16 {
        self.config.server.port
    }

    pub async fn new(config: Config, log_reload_handle: ReloadFilterHandle) -> eyre::Result<Self> {
        use crate::infrastructure::storage::LocalStorage;

        let db = Database::new(&config)
            .await
            .wrap_err("Failed to connect to database")?;

        let user_repo: Arc<dyn UserRepository> = Arc::new(UserRepositoryImpl::new());

        let auth_service = Arc::new(AuthService::new(
            db.clone(),
            Arc::clone(&user_repo),
            Arc::new(config.clone()),
        ));

        let storage: Arc<dyn StorageProvider> = Arc::new(LocalStorage::new(
            &config.upload.upload_dir,
            &config.upload.base_url,
        ));

        Ok(Self {
            config: Arc::new(config),
            db,
            auth_service,
            user_repo,
            storage,
            log_reload_handle: Arc::new(log_reload_handle),
        })
    }

    /// Build AppState from an existing Database — used by integration tests
    pub fn new_for_test(config: Config, db: Database) -> Self {
        use crate::infrastructure::storage::LocalStorage;
        use tracing_subscriber::{EnvFilter, Registry, reload};

        let user_repo: Arc<dyn UserRepository> = Arc::new(UserRepositoryImpl::new());
        let auth_service = Arc::new(AuthService::new(
            db.clone(),
            Arc::clone(&user_repo),
            Arc::new(config.clone()),
        ));
        // Dummy reload handle — never called in tests
        let (_, handle): (reload::Layer<EnvFilter, Registry>, ReloadFilterHandle) =
            reload::Layer::new(EnvFilter::new("error"));

        let storage: Arc<dyn StorageProvider> = Arc::new(LocalStorage::new(
            &config.upload.upload_dir,
            &config.upload.base_url,
        ));

        Self {
            config: Arc::new(config),
            db,
            auth_service,
            user_repo,
            storage,
            log_reload_handle: Arc::new(handle),
        }
    }
}
