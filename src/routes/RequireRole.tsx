import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/stores/authStore';
import type { UserRoleType } from '@/features/auth/types/auth.types';
import { useLanguage } from '@/shared/languages';

interface RequireRoleProps {
  roles: UserRoleType[];
}

export function RequireRole({ roles }: RequireRoleProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const { t } = useLanguage();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center surface-base px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('common.accessDenied')}</h2>
          <p className="text-muted-foreground mb-6">{t('common.accessDeniedDescription')}</p>
          <button type="button" onClick={() => window.history.back()} className="btn-primary px-6 py-2">
            {t('common.goBack')}
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
