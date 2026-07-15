import { useCallback, useEffect, useState } from 'react';
import { engagementService } from '../services/engagement.service';
import type { EngagementScope, PlatformNotification } from '../types/engagement.types';

export function useNotifications(scope: EngagementScope) {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setNotifications(await engagementService.listNotifications(scope));
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  const markAllRead = useCallback(async () => {
    setNotifications(await engagementService.markAllRead(scope));
  }, [scope]);

  useEffect(() => {
    void reload();
    const timer = window.setInterval(() => {
      void reload();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, [reload]);

  return {
    notifications,
    unreadCount: notifications.filter((item) => item.status === 'unread').length,
    isLoading,
    markAllRead,
    reload,
  };
}
