const ADMIN_AUTH_API_PREFIX = '/api/v1/auth/admin';

export const adminDirectoryEndpoints = {
  organizations: `${ADMIN_AUTH_API_PREFIX}/organizations`,
  users: `${ADMIN_AUTH_API_PREFIX}/users`,
  banUser: (userId: string) =>
    `${ADMIN_AUTH_API_PREFIX}/users/${encodeURIComponent(userId)}/ban`,
  unbanUser: (userId: string) =>
    `${ADMIN_AUTH_API_PREFIX}/users/${encodeURIComponent(userId)}/unban`,
  resetUserPassword: (userId: string) =>
    `${ADMIN_AUTH_API_PREFIX}/users/${encodeURIComponent(userId)}/reset-password`,
} as const;
