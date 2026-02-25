use tracing::info;
use tracing_subscriber::util::SubscriberInitExt;

use quax::{
    bootstrap,
    infrastructure::{config, env, logging, server},
    state::AppState,
};

#[tokio::main]
async fn main() -> eyre::Result<()> {
    // 1. Load environment variables
    env::load();

    // 2. Set up error handling
    color_eyre::install()?;

    // 3. Load configuration (fail-fast validation)
    let config = config::Config::load()?;

    // 4. Set up logging
    let (subscriber, reload_handle) = logging::setup_subscriber();
    subscriber.init();
    info!(
        port = config.server.port,
        rust_env = %config.rust_env,
        "🚀 Application starting..."
    );

    // 5. Initialize application state
    let state = AppState::new(config.clone(), reload_handle).await?;
    info!("✅ Application state initialized");

    // 6. Bootstrap (create initial admin if needed)
    bootstrap::bootstrap(&state.db, &config).await?;

    // 7. Start server (dual-stack, graceful shutdown)
    server::serve(state).await
}
