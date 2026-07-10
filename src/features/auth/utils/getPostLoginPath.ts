import type { UserRoleType } from '../types/auth.types';
import { UserRole } from '../types/auth.types';

export function getPostLoginPath(role: UserRoleType): string {
  switch (role) {
    case UserRole.ADMIN:
      return '/admin';
    case UserRole.HR:
    case UserRole.ORGANIZE:
      return '/employer';
    case UserRole.CANDIDATE:
    default:
      return '/profile';
  }
}
