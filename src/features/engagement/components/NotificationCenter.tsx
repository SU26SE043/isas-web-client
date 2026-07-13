import { BellRing, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { PlatformNotification } from '../types/engagement.types';

interface NotificationCenterProps {
  notifications: PlatformNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
}

export function NotificationCenter({ notifications, unreadCount, onMarkAllRead }: NotificationCenterProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-subtle bg-surface-overlay text-muted-foreground">
              <BellRing className="h-5 w-5" aria-hidden />
              {unreadCount > 0 ? <span className="absolute -right-1 -top-1 rounded-full bg-error px-1.5 py-0.5 text-[10px] font-semibold text-white">{unreadCount}</span> : null}
            </div>
            <div>
              <p className="font-medium text-foreground">{t('engagement.notifications.center')}</p>
              <p className="text-sm text-muted-foreground">{t('engagement.notifications.centerHint')}</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={onMarkAllRead}>
            <CheckCheck aria-hidden />
            {t('engagement.notifications.markAll')}
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="rounded-lg border border-subtle bg-surface-overlay p-6 text-center">
              <p className="font-medium text-foreground">{t('engagement.notifications.emptyTitle')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('engagement.notifications.emptyDescription')}</p>
            </div>
          ) : notifications.map((notification) => (
            <article key={notification.id} className={cn('rounded-lg border p-4', notification.status === 'unread' ? 'border-info/30 bg-info/10' : 'border-subtle bg-surface-overlay')}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{t(notification.titleKey)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t(notification.bodyKey)}</p>
                </div>
                <span className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(notification.createdAt))}</span>
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
