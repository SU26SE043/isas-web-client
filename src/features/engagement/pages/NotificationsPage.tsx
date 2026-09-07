import { BellPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { EngagementPageShell } from '../components/EngagementPageShell';
import { NotificationCenter } from '../components/NotificationCenter';
import { useEngagement } from '../hooks/useEngagement';
import type { EngagementScope } from '../types/engagement.types';

const screenByScope: Record<EngagementScope, string> = {
  candidate: '',
  employer: '',
  admin: '',
};

export function NotificationsPage({ scope }: { scope: EngagementScope }) {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAllRead, triggerNotification } = useEngagement(scope);

  return (
    <EngagementPageShell
      eyebrow={screenByScope[scope]}
      title={t('engagement.notifications.title')}
      description={t('engagement.notifications.description')}
      actions={(
        <Button type="button" variant="outline" onClick={triggerNotification}>
          <BellPlus aria-hidden />
          {t('engagement.notifications.trigger')}
        </Button>
      )}
    >
      <NotificationCenter notifications={notifications} unreadCount={unreadCount} onMarkAllRead={markAllRead} />
    </EngagementPageShell>
  );
}
