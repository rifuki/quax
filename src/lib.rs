pub mod feature;
pub mod infrastructure;
pub mod routes;
pub mod state;

// Re-export commonly used types
pub use infrastructure::web::response::{ApiError, ApiResult, ApiSuccess, ErrorCode};
