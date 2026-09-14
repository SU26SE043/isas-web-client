import { UserRole, type UserRoleType } from '../types/auth.types';

const HOME_BY_ROLE: Record<Exclude<UserRoleType, typeof UserRole.GUEST>, string> = {
  [UserRole.CANDIDATE]: '/candidate/dashboard',
  [UserRole.ORG_ADMIN]: '/employer/dashboard',
  [UserRole.HR_MEMBER]: '/employer/dashboard',
  [UserRole.ADMIN]: '/admin',
  [UserRole.NO_ROLE]: '/access-denied',
};

/** Account / profile destination for shared chrome (avatar menu, marketing header). */
const PROFILE_BY_ROLE: Record<Exclude<UserRoleType, typeof UserRole.GUEST>, string> = {
  [UserRole.CANDIDATE]: '/candidate/profile',
  [UserRole.ORG_ADMIN]: '/employer/settings',
  [UserRole.HR_MEMBER]: '/employer/settings',
  [UserRole.ADMIN]: '/admin/settings',
  [UserRole.NO_ROLE]: '/access-denied',
};

/** Path prefixes each role may land on after login (deep-link restore). */
const ALLOWED_PREFIXES_BY_ROLE: Record<Exclude<UserRoleType, typeof UserRole.GUEST>, string[]> = {
  [UserRole.CANDIDATE]: [
    '/candidate',
    '/practice',
    '/interview',
    '/cv-analysis',
    '/profile',
    '/invite',
    '/invitations',
  ],
  [UserRole.ORG_ADMIN]: ['/employer', '/enterprise'],
  [UserRole.HR_MEMBER]: ['/employer', '/enterprise'],
  [UserRole.ADMIN]: ['/admin', '/employer', '/enterprise'],
  [UserRole.NO_ROLE]: [],
};

export function getPostLoginPath(role: UserRoleType): string {
  if (role === UserRole.GUEST) {
    return '/login';
  }
  return HOME_BY_ROLE[role] ?? '/access-denied';
}

/** Role-aware profile/settings home — never defaults OrgAdmin/HrMember/Admin to Candidate. */
export function getProfileHomePath(role: UserRoleType): string {
  if (role === UserRole.GUEST) {
    return '/login';
  }
  return PROFILE_BY_ROLE[role] ?? '/access-denied';
}

export function isPathAllowedForRole(role: UserRoleType, pathname: string | null | undefined): boolean {
  if (!pathname || role === UserRole.GUEST) return false;
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return false;

  const blockedPrefixes = ['/login', '/register', '/mfa', '/verify-email', '/forgot-password', '/reset-password', '/session-expired', '/account-locked', '/access-denied'];
  if (blockedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }

  return (ALLOWED_PREFIXES_BY_ROLE[role] ?? []).some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Prefer a safe deep-link only when it matches the authenticated role.
 * Never fall back to Candidate for OrgAdmin / HrMember / Admin.
 */
export function resolvePostLoginPath(
  role: UserRoleType,
  requestedPath?: string | null,
): string {
  // Platform Admin always enters the Admin console after authentication.
  // Do not restore an employer deep-link that may have been the page where
  // the shared login modal was opened.
  if (role === UserRole.ADMIN) {
    return getPostLoginPath(role);
  }

  if (requestedPath && isPathAllowedForRole(role, requestedPath)) {
    return requestedPath;
  }
  return getPostLoginPath(role);
}

/** Trang mà đăng nhập xong PHẢI quay lại (điểm tiếp tục có nghĩa), không phải mọi trang marketing. */
const RETURN_TO_CURRENT_PATH = /^\/(invite|invitations)\//;

/**
 * Đường muốn quay lại sau khi đăng nhập từ AuthModal.
 *
 * Ưu tiên `state.from` (do RequireAuth / link "Đăng nhập" trên trang mời đặt). Không có thì lấy CHÍNH
 * trang đang mở modal — nhưng CHỈ khi đó là trang mời: header marketing mở modal tại chỗ
 * (`?auth=login`) mà không đặt `state`, nên ứng viên bấm "Đăng nhập" ngay trên `/invite/<token>` bị
 * ném về dashboard rồi phải mở lại link (đo thật 2026-09-11). Các trang marketing khác (`/`,
 * `/pricing`, `/enterprise`…) giữ mặc định "về nhà theo vai" — `/enterprise` nằm trong allowlist của
 * employer (vì các redirect legacy `/enterprise/*`) nên trả về "trang hiện tại" bừa sẽ đưa employer
 * quay lại trang marketing có CTA "Đăng ký" thay vì dashboard (review 2026-09-11).
 * Kết quả vẫn đi qua `resolvePostLoginPath` ⇒ vai không được phép vào trang đó thì về nhà theo vai.
 */
export function getRequestedReturnPath(
  state: unknown,
  currentPathname: string | null | undefined,
): string | undefined {
  const from = (state as { from?: { pathname?: string } } | null)?.from?.pathname;
  if (from) return from;
  if (currentPathname && RETURN_TO_CURRENT_PATH.test(currentPathname)) return currentPathname;
  return undefined;
}
