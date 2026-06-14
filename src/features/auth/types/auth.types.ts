export interface UpdateProfileRequest {
  fullName?: string;
  location?: string;
  title?: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  location: string;
  title: string;
  role: UserRole;
  createdAt: string;
}

export const UserRole = {
  ADMIN: 'admin',
  HR: 'hr',
  INTERVIEWER: 'interviewer',
  CANDIDATE: 'Candidate',

