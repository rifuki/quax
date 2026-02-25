/**
 * Auth Types
 * Aligned with Quax backend
 */

// JWT Token Response (aligned dengan backend)
export interface TokenResponse {
  access_token: string;
  expires_in: number; // in seconds
}

// User
export interface User {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: "user" | "admin";
  created_at?: string;
  avatar_url?: string;
}

// Auth Response (backend tidak kirim csrf_token)
export interface AuthResponse {
  user: User;
  token: TokenResponse;
}

// Login Request
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register Request
export interface RegisterCredentials {
  email: string;
  username?: string;
  name: string;
  password: string;
}

// Auth Context Type
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}
