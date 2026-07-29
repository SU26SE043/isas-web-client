/** Gateway prefix — see docs/API/Auth.md */
const AUTH_API_PREFIX = '/api/v1/auth';

export const authEndpoints = {
  register: `${AUTH_API_PREFIX}/register`,
  registerOrg: `${AUTH_API_PREFIX}/register-org`,
  login: `${AUTH_API_PREFIX}/login`,
  loginGoogle: `${AUTH_API_PREFIX}/login-google`,
  loginGoogleCallback: `${AUTH_API_PREFIX}/login-google-callback`,
  googleExchange: `${AUTH_API_PREFIX}/google/exchange`,
  loginSso: `${AUTH_API_PREFIX}/login-sso`,
  refresh: `${AUTH_API_PREFIX}/refresh`,
  logout: `${AUTH_API_PREFIX}/logout`,
  me: `${AUTH_API_PREFIX}/me`,
  org: `${AUTH_API_PREFIX}/org`,
  orgMembers: `${AUTH_API_PREFIX}/org/members`,
  orgMember: (userId: string) => `${AUTH_API_PREFIX}/org/members/${encodeURIComponent(userId)}`,
  forgotPassword: `${AUTH_API_PREFIX}/forgot-password`,
  verifyOtp: `${AUTH_API_PREFIX}/verify-otp`,
  resetPassword: `${AUTH_API_PREFIX}/reset-password`,
  verifyEmail: `${AUTH_API_PREFIX}/verify-email`,
  resendVerification: `${AUTH_API_PREFIX}/resend-verification`,
  verifyMfa: `${AUTH_API_PREFIX}/mfa/verify`,
} as const;
