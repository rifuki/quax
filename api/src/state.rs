use std::sync::Arc;

use eyre::WrapErr;

use crate::{
    feature::{
        admin::{
            stats::{StatsRepository, StatsRepositoryImpl, StatsService},
            user::{AdminUserRepository, AdminUserRepositoryImpl},
        },
        auth::service::AuthService,
        user::repository::{UserRepository, UserRepositoryImpl},
    },
    infrastructure::{
        config::Config,
        logging::ReloadFilterHandle,
        persistence::{
            Database,
            redis::create_redis_pool,
            redis_trait::{RedisSessionBlacklist, SessionBlacklist},
        },
        storage::StorageProvider,
    },
};

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<Config>,
    pub db: Database,
    pub auth_service: Arc<AuthService>,
    pub user_repo: Arc<dyn UserRepository>,
    pub admin_user_repo: Arc<dyn AdminUserRepository>,
    pub stats_service: Arc<StatsService>,
    pub storage: Arc<dyn StorageProvider>,
    pub session_blacklist: Option<Arc<dyn SessionBlacklist>>,
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
        let admin_user_repo: Arc<dyn AdminUserRepository> = Arc::new(AdminUserRepositoryImpl::new());
        let stats_repository: Arc<dyn StatsRepository> = Arc::new(StatsRepositoryImpl::new());

        let auth_service = Arc::new(AuthService::new(
            db.clone(),
            Arc::clone(&user_repo),
            Arc::new(config.clone()),
        ));

        let stats_service = Arc::new(StatsService::new(stats_repository));

        let storage: Arc<dyn StorageProvider> = Arc::new(LocalStorage::new(
            &config.upload.upload_dir,
            &config.upload.base_url,
        ));

        // Initialize Redis if configured
        let session_blacklist = if let Some(ref _redis_url) = config.redis_url {
            match create_redis_pool(&config).await {
                Ok(pool) => {
                    tracing::info!("✅ Redis session blacklist enabled");
                    Some(Arc::new(RedisSessionBlacklist::new(pool)) as Arc<dyn SessionBlacklist>)
                }
                Err(e) => {
                    tracing::warn!("⚠️  Redis not available (session blacklist disabled): {e}");
                    None
                }
            }
        } else {
            tracing::info!("ℹ️  Redis not configured (session blacklist disabled)");
            None
        };

        Ok(Self {
            config: Arc::new(config),
            db,
            auth_service,
            user_repo,
            admin_user_repo,
            stats_service,
            storage,
            session_blacklist,
            log_reload_handle: Arc::new(log_reload_handle),
        })
    }

    /// Build AppState from an existing Database — used by integration tests
    pub fn new_for_test(config: Config, db: Database) -> Self {
        use crate::infrastructure::storage::LocalStorage;
        use tracing_subscriber::{EnvFilter, Registry, reload};

        let user_repo: Arc<dyn UserRepository> = Arc::new(UserRepositoryImpl::new());
        let admin_user_repo: Arc<dyn AdminUserRepository> = Arc::new(AdminUserRepositoryImpl::new());
        let stats_repository: Arc<dyn StatsRepository> = Arc::new(StatsRepositoryImpl::new());

        let auth_service = Arc::new(AuthService::new(
            db.clone(),
            Arc::clone(&user_repo),
            Arc::new(config.clone()),
        ));

        let stats_service = Arc::new(StatsService::new(stats_repository));

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
            admin_user_repo,
            stats_service,
            storage,
            session_blacklist: None, // No Redis in tests
            log_reload_handle: Arc::new(handle),
        }
    }
}
