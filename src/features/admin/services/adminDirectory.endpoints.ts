const ADMIN_AUTH_API_PREFIX = '/api/v1/auth/admin';

export const adminDirectoryEndpoints = {
  organizations: `${ADMIN_AUTH_API_PREFIX}/organizations`,
  users: `${ADMIN_AUTH_API_PREFIX}/users`,
} as const;
