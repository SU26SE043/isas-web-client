import type { UserRoleType } from '@/features/auth/types/auth.types';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';

interface ProtectedRouteProps {
  allowedRoles?: UserRoleType[];
}

/** @deprecated Prefer nested RequireAuth / RequireRole route elements. */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  if (allowedRoles?.length) {
    return <RequireRole roles={allowedRoles} />;
  }

  return <RequireAuth />;
}

export { RequireAuth } from './RequireAuth';
export { RequireRole } from './RequireRole';
