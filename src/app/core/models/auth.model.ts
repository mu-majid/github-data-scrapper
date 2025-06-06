export interface GitHubIntegration {
  id: string;
  username: string;
  email: string;
  avatarUrl: string;
  connectedAt: string;
  lastSyncAt: string;
}

export interface AuthResponse {
  success: boolean;
  authenticated: boolean;
  integration?: GitHubIntegration;
  message?: string;
}

export interface OAuthResponse {
  success: boolean;
  authUrl: string;
  state: string;
}