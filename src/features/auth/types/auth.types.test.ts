/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { parseAuthTokens, unwrapAuthPayload } from '@/shared/api/authPayload';
import { normalizeUserRole, parseRegisterResponse, parseUser, UserRole } from './auth.types';

describe('unwrapAuthPayload', () => {
  it('returns raw DTO when no wrapper', () => {
    const raw = { accessToken: 'a', refreshToken: 'r' };
    expect(unwrapAuthPayload(raw)).toEqual(raw);
  });

  it('unwraps ApiResponse.data when outer has no DTO keys', () => {
    expect(unwrapAuthPayload({ data: { id: '1', email: 'a@b.c' }, success: true })).toEqual({
      id: '1',
      email: 'a@b.c',
    });
  });
});

describe('parseAuthTokens', () => {
  it('parses Auth service login body', () => {
    expect(
      parseAuthTokens({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: '2026-07-14T15:00:00Z',
      }),
    ).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('parses PascalCase Auth service DTO keys', () => {
    expect(
      parseAuthTokens({
        AccessToken: 'access',
        RefreshToken: 'refresh',
        ExpiresAt: '2026-07-14T15:00:00Z',
      }),
    ).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('parses wrapped token body', () => {
    expect(
      parseAuthTokens({
        data: { accessToken: 'access', refreshToken: 'refresh' },
      }),
    ).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });
});

describe('parseRegisterResponse', () => {
  it('parses legacy plain-string register result', () => {
    expect(parseRegisterResponse('User ID: abc-123', 'x@y.z')).toEqual({
      id: 'abc-123',
      email: 'x@y.z',
    });
  });
});

describe('normalizeUserRole', () => {
  it('accepts only Candidate | OrgAdmin | HrMember | Admin', () => {
    expect(normalizeUserRole('Candidate')).toBe(UserRole.CANDIDATE);
    expect(normalizeUserRole('OrgAdmin')).toBe(UserRole.ORG_ADMIN);
    expect(normalizeUserRole('HrMember')).toBe(UserRole.HR_MEMBER);
    expect(normalizeUserRole('Admin')).toBe(UserRole.ADMIN);
    expect(normalizeUserRole('candidate')).toBe(UserRole.CANDIDATE);
    expect(normalizeUserRole('ORG_ADMIN')).toBe(UserRole.ORG_ADMIN);
  });

  it('rejects deleted legacy roles', () => {
    expect(normalizeUserRole('Employer')).toBeNull();
    expect(normalizeUserRole('organize')).toBeNull();
    expect(normalizeUserRole('HR')).toBeNull();
    expect(normalizeUserRole('interviewer')).toBeNull();
  });
});

describe('parseUser', () => {
  it('normalizes Candidate role and null profile fields', () => {
    expect(
      parseUser({
        id: '1',
        fullName: 'Test',
        email: 't@isas.dev',
        location: null,
        title: null,
        createdAt: '2026-07-14T00:00:00Z',
        role: 'Candidate',
      }),
    ).toEqual({
      id: '1',
      fullName: 'Test',
      email: 't@isas.dev',
      location: '',
      title: '',
      createdAt: '2026-07-14T00:00:00Z',
      role: UserRole.CANDIDATE,
    });
  });

  it('parses OrgAdmin profile from AuthService', () => {
    expect(
      parseUser({
        Id: 'org-1',
        FullName: 'Org Admin User',
        Email: 'orgadmin@isas.dev',
        Location: null,
        Title: null,
        CreatedAt: '2026-07-14T00:00:00Z',
        Role: 'OrgAdmin',
      }),
    ).toMatchObject({
      id: 'org-1',
      email: 'orgadmin@isas.dev',
      role: UserRole.ORG_ADMIN,
    });
  });

  it('rejects Employer (deleted role)', () => {
    expect(() =>
      parseUser({
        Id: 'emp-1',
        FullName: 'Employer User',
        Email: 'employer@isas.dev',
        Role: 'Employer',
      }),
    ).toThrow(/Invalid user role/);
  });
});
