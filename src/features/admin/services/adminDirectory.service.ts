import { apiClient } from '@/shared/api/apiClient';
import type {
  AdminDirectoryPage,
  AdminDirectoryUser,
  AdminOrganization,
  GetAdminOrganizationsParams,
  GetAdminUsersParams,
} from '../types/adminDirectory.types';
import {
  buildAdminOrganizationParams,
  buildAdminUserParams,
  parseAdminOrganizationsPage,
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

export const adminDirectoryService = {
  getAdminOrganizations,
  getAdminUsers,
};
