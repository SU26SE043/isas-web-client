import { NotificationBell } from '@/features/engagement/components/NotificationBell';
import type { EngagementScope } from '@/features/engagement/types/engagement.types';

interface DashboardEngagementBarProps {
  scope: EngagementScope;
}

export function DashboardEngagementBar({ scope }: DashboardEngagementBarProps) {
  return (
    <div className="glass-topbar sticky top-0 z-30 flex items-center justify-end border-b px-4 py-3 sm:px-6">
      <NotificationBell scope={scope} />
    </div>
  );
}
