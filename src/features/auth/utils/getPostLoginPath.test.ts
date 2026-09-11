/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { UserRole } from '../types/auth.types';
import {
  getRequestedReturnPath,
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

  it('always routes Admin to the Admin console', () => {
    expect(resolvePostLoginPath(UserRole.ADMIN, '/employer/dashboard')).toBe('/admin');
    expect(resolvePostLoginPath(UserRole.ADMIN, '/employer/campaigns')).toBe('/admin');
  });

  it('falls back to role home when requested path is missing', () => {
    expect(resolvePostLoginPath(UserRole.CANDIDATE, null)).toBe('/candidate/dashboard');
    expect(resolvePostLoginPath(UserRole.GUEST, '/employer/dashboard')).toBe('/login');
  });

  it('restores invitation deep-link for Candidate', () => {
    expect(resolvePostLoginPath(UserRole.CANDIDATE, '/invitations/abc-token')).toBe(
      '/invitations/abc-token',
    );
    expect(resolvePostLoginPath(UserRole.CANDIDATE, '/invite/abc-token')).toBe('/invite/abc-token');
  });
});

describe('getRequestedReturnPath — đăng nhập từ modal quay lại đúng trang', () => {
  it('ưu tiên state.from do RequireAuth / link trên trang mời đặt', () => {
    expect(getRequestedReturnPath({ from: { pathname: '/invite/abc' } }, '/pricing')).toBe('/invite/abc');
    // Cả hai đều là trang mời ⇒ vẫn phải là state.from (mutation đảo ưu tiên từng XANH vì ca trên
    // không phân biệt được — /pricing rơi khỏi regex nên from thắng "nhờ may").
    expect(getRequestedReturnPath({ from: { pathname: '/invite/abc' } }, '/invite/other')).toBe('/invite/abc');
  });

  it('không có state ⇒ lấy trang đang mở modal NẾU là trang mời (header marketing mở tại chỗ)', () => {
    expect(getRequestedReturnPath(null, '/invite/abc')).toBe('/invite/abc');
    expect(getRequestedReturnPath(undefined, '/invitations/abc')).toBe('/invitations/abc');
  });

  it('trang marketing khác (/, /pricing, /enterprise) không tính — về nhà theo vai như cũ', () => {
    // /enterprise nằm trong allowlist employer (redirect legacy) ⇒ trả về nó là đưa employer quay
    // lại trang marketing thay vì dashboard — review 2026-09-11.
    expect(getRequestedReturnPath(null, '/')).toBeUndefined();
    expect(getRequestedReturnPath(null, '/pricing')).toBeUndefined();
    expect(getRequestedReturnPath(null, '/enterprise')).toBeUndefined();
    expect(getRequestedReturnPath(null, '/invite')).toBeUndefined();
    expect(getRequestedReturnPath(null, '')).toBeUndefined();
    expect(getRequestedReturnPath(null, undefined)).toBeUndefined();
  });

  it('đường lấy từ trang hiện tại vẫn bị resolvePostLoginPath gác theo vai', () => {
    // Ứng viên đăng nhập trên trang mời ⇒ quay lại trang mời; employer thì về dashboard employer.
    expect(resolvePostLoginPath(UserRole.CANDIDATE, getRequestedReturnPath(null, '/invite/abc'))).toBe('/invite/abc');
    expect(resolvePostLoginPath(UserRole.ORG_ADMIN, getRequestedReturnPath(null, '/invite/abc'))).toBe('/employer/dashboard');
  });
});
