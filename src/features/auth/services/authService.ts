import { apiClient, authTokenStorage } from '../../../shared/api';
import type { AuthTokensResponse, LoginRequest, RegisterRequest, User, UserRole } from '../types/auth.types';
import { authEndpoints } from './authEndpoints';

export const authService = {
  register: async (payload: RegisterRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.register, payload);
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  login: async (payload: LoginRequest) => {
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.login, payload);
    console.log('Login response:', data); // Debug login response
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);

    // Verify token was saved
    const savedToken = authTokenStorage.getAccessToken();
    console.log('Token saved:', savedToken ? 'Yes' : 'No');
    console.log('Token preview:', savedToken?.substring(0, 20) + '...');

    return data;
  },
  refresh: async () => {
    const refreshToken = authTokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const { data } = await apiClient.post<AuthTokensResponse>(authEndpoints.refresh, { refreshToken });
    authTokenStorage.setTokens(data.accessToken, data.refreshToken);
    return data;
  },
  logout: async () => {
    const refreshToken = authTokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await apiClient.post(authEndpoints.logout, { refreshToken });
      }
    } finally {
      authTokenStorage.clear();
    }
  },
  me: async () => {
    try {
      const token = authTokenStorage.getAccessToken();
      console.log('Calling /api/auth/me with token:', token ? 'Token exists' : 'No token');
      console.log('Full token:', token); // Debug full token

      const { data } = await apiClient.get<User>(authEndpoints.me);
      console.log('User data received:', data);
      return data;
    } catch (error: any) {
      console.error('Error calling /auth/me:', error.response?.status, error.response?.data);
      console.error('Request headers:', error.config?.headers);

      // If /auth/me fails with 401, try to extract user info from token
      if (error.response?.status === 401) {
        console.log('Attempting to extract user info from token...');
        const token = authTokenStorage.getAccessToken();
        if (token) {
          try {
            // Decode JWT token to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('Token payload:', payload);

            // Create user object from token claims
            const roleFromToken = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
            const userFromToken: User = {
              id: payload.sub || payload.nameid || 'unknown',
              fullName: payload.name || payload.email || 'User',
              email: payload.email || 'unknown@example.com',
              location: '',
              title: '',
              role: roleFromToken === 'Candidate' ? 'Candidate' as UserRole : 'CANDIDATE' as UserRole,
              permissions: [],
              createdAt: new Date().toISOString(),
            };

            console.log('User extracted from token:', userFromToken);
            return userFromToken;
          } catch (decodeError) {
            console.error('Failed to decode token:', decodeError);
          }
        }
      }

      throw error;
    }
  },
};
