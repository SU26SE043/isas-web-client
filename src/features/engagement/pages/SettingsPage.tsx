import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { OrganizationProfileForm } from '../components/OrganizationProfileForm';
import { SettingsForm } from '../components/SettingsForm';
import { WebhookConfigNote } from '../components/WebhookConfigNote';
import { useEngagement, useOrganization } from '../hooks/useEngagement';
import type { EngagementScope } from '../types/engagement.types';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { UserRole } from '@/features/auth/types/auth.types';

const screenByScope: Record<EngagementScope, string> = {
  candidate: 'SCR-CAN-049',
  employer: 'SCR-EMP-067',
  admin: 'F-NOTIF-003',
};

export function SettingsPage({ scope }: { scope: EngagementScope }) {
  const { t } = useLanguage();
  const { preferences, savePreferences } = useEngagement(scope);
  const role = useAuthStore((state) => state.user?.role);
  const isOrganizationMember = scope === 'employer'
    && (role === UserRole.ORG_ADMIN || role === UserRole.HR_MEMBER);
  const organization = useOrganization(isOrganizationMember);

  return (
    <EngagementPageShell eyebrow={screenByScope[scope]} title={t('engagement.settings.title')} description={t('engagement.settings.description')}>
      <div className="space-y-6">
        {isOrganizationMember ? (
          <OrganizationProfileForm
            {...organization}
            canEdit={role === UserRole.ORG_ADMIN}
            onSave={organization.save}
            onRetry={organization.reload}
          />
        ) : null}
        <SettingsForm preferences={preferences} onSave={savePreferences} />
        {scope === 'employer' ? <WebhookConfigNote /> : null}
      </div>
    </EngagementPageShell>
  );
}
