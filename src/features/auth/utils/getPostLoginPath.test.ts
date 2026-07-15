/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { UserRole } from '../types/auth.types';
import {
  getPostLoginPath,
  getProfileHomePath,
  isPathAllowedForRole,
  resolvePostLoginPath,
} from './getPostLoginPath';

describe('getPostLoginPath', () => {
  it('routes OrgAdmin to employer dashboard', () => {
    expect(getPostLoginPath(UserRole.ORG_ADMIN)).toBe('/employer/dashboard');
  });

  it('routes Candidate to candidate dashboard', () => {
    expect(getPostLoginPath(UserRole.CANDIDATE)).toBe('/candidate/dashboard');
  });

  it('routes HrMember to employer dashboard', () => {
    expect(getPostLoginPath(UserRole.HR_MEMBER)).toBe('/employer/dashboard');
  });

  it('routes Admin to admin home', () => {
    expect(getPostLoginPath(UserRole.ADMIN)).toBe('/admin');
  });

  it('routes Guest to login', () => {
    expect(getPostLoginPath(UserRole.GUEST)).toBe('/login');
  });
});

describe('getProfileHomePath', () => {
  it('routes Candidate to candidate profile', () => {
    expect(getProfileHomePath(UserRole.CANDIDATE)).toBe('/candidate/profile');
  });

  it('routes OrgAdmin and HrMember to employer settings', () => {
    expect(getProfileHomePath(UserRole.ORG_ADMIN)).toBe('/employer/settings');
    expect(getProfileHomePath(UserRole.HR_MEMBER)).toBe('/employer/settings');
  });

  it('routes Admin to admin settings', () => {
    expect(getProfileHomePath(UserRole.ADMIN)).toBe('/admin/settings');
  });

  it('routes Guest to login', () => {
    expect(getProfileHomePath(UserRole.GUEST)).toBe('/login');
  });
});

describe('isPathAllowedForRole', () => {
  it('allows employer paths for OrgAdmin', () => {
    expect(isPathAllowedForRole(UserRole.ORG_ADMIN, '/employer/campaigns')).toBe(true);
  });

  it('rejects candidate paths for OrgAdmin', () => {
    expect(isPathAllowedForRole(UserRole.ORG_ADMIN, '/candidate/dashboard')).toBe(false);
  });
});

describe('resolvePostLoginPath', () => {
  it('does not restore Candidate dashboard for OrgAdmin', () => {
    expect(resolvePostLoginPath(UserRole.ORG_ADMIN, '/candidate/dashboard')).toBe(
      '/employer/dashboard',
    );
  });

  it('restores allowed employer deep-link for OrgAdmin', () => {
    expect(resolvePostLoginPath(UserRole.ORG_ADMIN, '/employer/campaigns')).toBe(
      '/employer/campaigns',
    );
  });

  it('falls back to role home when requested path is missing', () => {
    expect(resolvePostLoginPath(UserRole.CANDIDATE, null)).toBe('/candidate/dashboard');
    expect(resolvePostLoginPath(UserRole.GUEST, '/employer/dashboard')).toBe('/login');
  });
});
