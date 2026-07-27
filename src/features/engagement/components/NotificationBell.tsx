import { Bell, CheckCheck } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { useNotifications } from '../hooks/useNotifications';
import type { EngagementScope } from '../types/engagement.types';

const listPathByScope: Record<EngagementScope, string> = {
  candidate: '/candidate/notifications',
  employer: '/employer/notifications',
  admin: '/admin/notifications',
};

interface NotificationBellProps {
  scope: EngagementScope;
  /** Where the dropdown panel anchors relative to the trigger. */
  panelPlacement?: 'bottom-end' | 'sidebar';
  /** Quieter trigger that matches sidebar nav icons. */
  variant?: 'default' | 'sidebar';
  className?: string;
}

export function NotificationBell({
  scope,
  panelPlacement = 'bottom-end',
  variant = 'default',
  className,
}: NotificationBellProps) {
  const { t, language } = useLanguage();
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAllRead } = useNotifications(scope);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const preview = notifications.slice(0, 5);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        className={cn(
          'relative inline-flex items-center justify-center text-muted-foreground transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
          variant === 'sidebar'
            ? 'h-4 w-4 shrink-0 hover:text-foreground'
            : 'h-9 w-9 rounded-lg border border-subtle bg-surface-overlay hover:bg-surface-elevated hover:text-foreground',
        )}
        aria-label={t('engagement.notifications.bell')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 ? (
          <span
            className={cn(
              'absolute min-w-[1.125rem] rounded-full bg-error px-1 py-0.5 text-center text-[10px] font-semibold leading-none text-white',
              variant === 'sidebar' ? '-right-2.5 -top-2.5' : '-right-1 -top-1',
            )}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-label={t('engagement.notifications.center')}
          className={cn(
            'z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-subtle bg-surface-raised p-4 shadow-lg',
            panelPlacement === 'sidebar'
              ? 'absolute bottom-0 left-full ml-2'
              : 'absolute right-0 mt-2',
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{t('engagement.notifications.center')}</p>
            <Button type="button" variant="ghost" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4" aria-hidden />
              {t('engagement.notifications.markAll')}
            </Button>
          </div>

          <div className="max-h-72 space-y-2 overflow-y-auto">
            {preview.length === 0 ? (
              <div className="rounded-lg border border-subtle bg-surface-overlay p-4 text-center">
                <p className="text-sm font-medium text-foreground">{t('engagement.notifications.emptyTitle')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('engagement.notifications.emptyDescription')}</p>
              </div>
            ) : (
              preview.map((notification) => (
                <article
                  key={notification.id}
                  className={cn(
                    'rounded-lg border p-3',
                    notification.status === 'unread'
                      ? 'border-info/30 bg-info/10'
                      : 'border-subtle bg-surface-overlay',
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{t(notification.titleKey)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t(notification.bodyKey)}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }).format(new Date(notification.createdAt))}
                  </p>
                </article>
              ))
            )}
          </div>

          <div className="mt-3 border-t border-subtle pt-3">
            <Link
              to={listPathByScope[scope]}
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              onClick={() => setOpen(false)}
            >
              {t('engagement.notifications.viewAll')}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
