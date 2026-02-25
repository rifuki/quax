// App configuration
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const APP_NAME = "Quax";
export const APP_VERSION = "0.1.0";

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Token expiration buffer (in seconds) - refresh 5 minutes before expiry
export const TOKEN_REFRESH_BUFFER = 300;
