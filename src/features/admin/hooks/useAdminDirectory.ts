import { useQuery } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminDirectoryService } from '../services/adminDirectory.service';
import type { GetAdminOrganizationsParams, GetAdminUsersParams } from '../types/adminDirectory.types';

export const adminDirectoryKeys = {
  all: ['admin-auth-directory'] as const,
  organizations: (params: GetAdminOrganizationsParams) =>
    [...adminDirectoryKeys.all, 'organizations', params] as const,
  users: (params: GetAdminUsersParams) =>
    [...adminDirectoryKeys.all, 'users', params] as const,
};

const retryDirectoryQuery = (failureCount: number, error: unknown) => {
  const status = getApiStatusCode(error);
  if (status === 401 || status === 403) return false;
  return failureCount < 2;
};

export function useAdminOrganizations(params: GetAdminOrganizationsParams) {
  return useQuery({
    queryKey: adminDirectoryKeys.organizations(params),
    queryFn: () => adminDirectoryService.getAdminOrganizations(params),
    placeholderData: (previous) => previous,
    retry: retryDirectoryQuery,
  });
}

export function useAdminUsers(params: GetAdminUsersParams) {
  return useQuery({
    queryKey: adminDirectoryKeys.users(params),
    queryFn: () => adminDirectoryService.getAdminUsers(params),
    placeholderData: (previous) => previous,
    retry: retryDirectoryQuery,
  });
}
