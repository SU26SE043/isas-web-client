import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { OrganizationProfileForm } from '../components/OrganizationProfileForm';
import { useOrganization } from '../hooks/useEngagement';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';

/**
 * Trang "Tổ chức" của employer — form `GET/PUT /auth/org` thật (OrgAdmin sửa, HrMember chỉ xem).
 * Trước đây là `SettingsPage` gộp thêm preferences thông báo + ghi chú webhook chạy trên fixture — gỡ 2026-09-13.
 */
export function OrganizationSettingsPage() {
  const { t } = useLanguage();
  const role = useAuthStore((state) => state.user?.role);
  const isOrganizationMember = role === UserRole.ORG_ADMIN || role === UserRole.HR_MEMBER;
  const organization = useOrganization(isOrganizationMember);

  return (
    <EngagementPageShell title={t('engagement.organization.pageTitle')} description={t('engagement.organization.description')}>
      {isOrganizationMember ? (
        <OrganizationProfileForm
          {...organization}
          canEdit={role === UserRole.ORG_ADMIN}
          onSave={organization.save}
          onRetry={organization.reload}
        />
      ) : (
        <p className="text-sm text-muted-foreground">{t('engagement.organization.error.noContext')}</p>
      )}
    </EngagementPageShell>
  );
}
