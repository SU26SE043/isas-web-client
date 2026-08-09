import { normalizeUserRole, UserRole } from '@/features/auth/types/auth.types';
import { unwrapAuthPayload } from '@/shared/api/authPayload';
import type {
  AdminDirectoryPage,
  AdminDirectoryUser,
  AdminOrganization,
  AdminDirectoryRole,
  GetAdminOrganizationsParams,
  GetAdminUsersParams,
} from '../types/adminDirectory.types';
import { readNextCursorHeader } from './adminCampaignsApi';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function pickString(record: Record<string, unknown>, camel: string, pascal: string) {
  const value = record[camel] ?? record[pascal];
  return typeof value === 'string' ? value.trim() : '';
}

function optionalString(record: Record<string, unknown>, camel: string, pascal: string) {
  return pickString(record, camel, pascal) || undefined;
}

function normalizeAdminDirectoryRole(rawRole: string): AdminDirectoryRole | null {
  const normalized = rawRole.trim().toLowerCase().replace(/[\s_-]/g, '');
  if (normalized === 'employer') return 'Employer';
  if (normalized === 'norole') return 'NoRole';

  const role = normalizeUserRole(rawRole);
  return role && role !== UserRole.GUEST ? role as AdminDirectoryRole : null;
}

function unwrapList(data: unknown): unknown[] {
  const payload = unwrapAuthPayload<unknown>(data);
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (Array.isArray(record?.items)) return record.items;
  if (Array.isArray(record?.organizations)) return record.organizations;
  if (Array.isArray(record?.users)) return record.users;
  throw new Error('Invalid Admin directory response');
}

export function parseAdminOrganization(raw: unknown): AdminOrganization {
  const record = asRecord(raw);
  if (!record) throw new Error('Invalid organization payload');
  const id = pickString(record, 'id', 'Id');
  const name = pickString(record, 'name', 'Name');
  const createdAt = pickString(record, 'createdAt', 'CreatedAt');
  const rawCount = record.memberCount ?? record.MemberCount;
  const memberCount = typeof rawCount === 'number'
    ? rawCount
    : typeof rawCount === 'string' && rawCount.trim()
      ? Number(rawCount)
      : Number.NaN;
  if (!id || !name || !createdAt || !Number.isInteger(memberCount) || memberCount < 0) {
    throw new Error('Organization response missing required fields');
  }
  return {
    id,
    name,
    taxCode: optionalString(record, 'taxCode', 'TaxCode'),
    createdAt,
    memberCount,
  };
}

export function parseAdminDirectoryUser(raw: unknown): AdminDirectoryUser {
  const record = asRecord(raw);
  if (!record) throw new Error('Invalid Admin user payload');
  const id = pickString(record, 'id', 'Id');
  const email = pickString(record, 'email', 'Email');
  const fullName = pickString(record, 'fullName', 'FullName');
  const createdAt = pickString(record, 'createdAt', 'CreatedAt');
  const rawRole = pickString(record, 'role', 'Role');
  const role = normalizeAdminDirectoryRole(rawRole);
  if (!id || !email || !fullName || !createdAt || !role) {
    throw new Error('Admin user response missing required fields');
  }
  return {
    id,
    email,
    fullName,
    role,
    orgId: optionalString(record, 'orgId', 'OrgId'),
    orgName: optionalString(record, 'orgName', 'OrgName'),
    orgRole: optionalString(record, 'orgRole', 'OrgRole'),
    createdAt,
    bannedAt: optionalString(record, 'bannedAt', 'BannedAt'),
    banReason: optionalString(record, 'banReason', 'BanReason'),
  };
}

export function parseAdminOrganizationsPage(data: unknown, headers: unknown): AdminDirectoryPage<AdminOrganization> {
  return {
    items: unwrapList(data).map(parseAdminOrganization),
    nextCursor: readNextCursorHeader(headers),
  };
}

export function parseAdminUsersPage(data: unknown, headers: unknown): AdminDirectoryPage<AdminDirectoryUser> {
  return {
    items: unwrapList(data).map(parseAdminDirectoryUser),
    nextCursor: readNextCursorHeader(headers),
  };
}

function cleanCommonParams(params: GetAdminOrganizationsParams) {
  const limit = params.limit == null
    ? undefined
    : Math.min(500, Math.max(1, Math.trunc(params.limit)));
  return {
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.cursor?.trim() ? { cursor: params.cursor.trim() } : {}),
    ...(limit != null ? { limit } : {}),
  };
}

export function buildAdminOrganizationParams(params: GetAdminOrganizationsParams) {
  return cleanCommonParams(params);
}

export function buildAdminUserParams(params: GetAdminUsersParams) {
  return {
    ...cleanCommonParams(params),
    ...(params.role ? { role: params.role } : {}),
  };
}
