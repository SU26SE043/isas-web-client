export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}
