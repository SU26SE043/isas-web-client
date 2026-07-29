import { apiClient } from '@/shared/api/apiClient';
import type {
  AdminDirectoryPage,
  AdminDirectoryUser,
  AdminBanUserInput,
  AdminResetUserPasswordInput,
  AdminOrganization,
  GetAdminOrganizationsParams,
  GetAdminUsersParams,
} from '../types/adminDirectory.types';
import {
  buildAdminOrganizationParams,
  buildAdminUserParams,
  parseAdminOrganizationsPage,
  parseAdminDirectoryUser,
  parseAdminUsersPage,
} from '../utils/adminDirectoryApi';
import { adminDirectoryEndpoints } from './adminDirectory.endpoints';

export async function getAdminOrganizations(
  params: GetAdminOrganizationsParams,
): Promise<AdminDirectoryPage<AdminOrganization>> {
  const response = await apiClient.get<unknown>(adminDirectoryEndpoints.organizations, {
    params: buildAdminOrganizationParams(params),
  });
  return parseAdminOrganizationsPage(response.data, response.headers);
}

export async function getAdminUsers(
  params: GetAdminUsersParams,
): Promise<AdminDirectoryPage<AdminDirectoryUser>> {
  const response = await apiClient.get<unknown>(adminDirectoryEndpoints.users, {
    params: buildAdminUserParams(params),
  });
  return parseAdminUsersPage(response.data, response.headers);
}

export async function banAdminUser(
  userId: string,
  input: AdminBanUserInput,
): Promise<AdminDirectoryUser> {
  const reason = input.reason?.trim();
  const response = await apiClient.post<unknown>(
    adminDirectoryEndpoints.banUser(userId),
    reason ? { reason } : {},
  );
  return parseAdminDirectoryUser(response.data);
}

export async function unbanAdminUser(userId: string): Promise<AdminDirectoryUser> {
  const response = await apiClient.post<unknown>(
    adminDirectoryEndpoints.unbanUser(userId),
  );
  return parseAdminDirectoryUser(response.data);
}

export async function resetAdminUserPassword(
  userId: string,
  input: AdminResetUserPasswordInput,
): Promise<void> {
  await apiClient.post(
    adminDirectoryEndpoints.resetUserPassword(userId),
    input,
  );
}

export const adminDirectoryService = {
  banAdminUser,
  getAdminOrganizations,
  getAdminUsers,
  resetAdminUserPassword,
  unbanAdminUser,
};
