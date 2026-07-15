import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { SettingsForm } from '../components/SettingsForm';
import { WebhookConfigNote } from '../components/WebhookConfigNote';
import { useEngagement } from '../hooks/useEngagement';
import type { EngagementScope } from '../types/engagement.types';

const screenByScope: Record<EngagementScope, string> = {
  candidate: 'SCR-CAN-049',
  employer: 'SCR-EMP-067',
  admin: 'F-NOTIF-003',
};

export function SettingsPage({ scope }: { scope: EngagementScope }) {
  const { t } = useLanguage();
  const { preferences, savePreferences } = useEngagement(scope);

  return (
    <EngagementPageShell eyebrow={screenByScope[scope]} title={t('engagement.settings.title')} description={t('engagement.settings.description')}>
      <div className="space-y-6">
        <SettingsForm preferences={preferences} onSave={savePreferences} />
        {scope === 'employer' ? <WebhookConfigNote /> : null}
      </div>
    </EngagementPageShell>
  );
}
