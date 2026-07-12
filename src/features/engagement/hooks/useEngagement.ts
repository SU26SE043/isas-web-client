import { useCallback, useEffect, useState } from 'react';
import { engagementService } from '../services/engagement.service';
import type { EngagementScope, NotificationPreferences, PlatformNotification, SupportTicket, SupportTicketInput, TeamInviteInput, TeamMember } from '../types/engagement.types';

export function useEngagement(scope: EngagementScope) {
  const [notifications, setNotifications] = useState<PlatformNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextNotifications, nextPreferences, nextTickets] = await Promise.all([
        engagementService.listNotifications(scope),
        engagementService.getPreferences(scope),
        engagementService.listTickets(scope),
      ]);
      setNotifications(nextNotifications);
      setPreferences(nextPreferences);
      setTickets(nextTickets);
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  const markAllRead = useCallback(async () => setNotifications(await engagementService.markAllRead(scope)), [scope]);
  const triggerNotification = useCallback(async () => {
    const notification = await engagementService.triggerNotification(scope);
    setNotifications((items) => [notification, ...items]);
  }, [scope]);
  const savePreferences = useCallback(async (input: NotificationPreferences) => setPreferences(await engagementService.savePreferences(scope, input)), [scope]);
  const createTicket = useCallback(async (input: SupportTicketInput) => {
    const ticket = await engagementService.createTicket(scope, input);
    setTickets((items) => [ticket, ...items]);
  }, [scope]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { notifications, preferences, tickets, unreadCount: notifications.filter((item) => item.status === 'unread').length, isLoading, markAllRead, triggerNotification, savePreferences, createTicket };
}

export function useEmployerTeam() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setTeam(await engagementService.listTeam());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invite = useCallback(async (input: TeamInviteInput) => setTeam(await engagementService.inviteTeamMember(input)), []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { team, isLoading, invite };
}
