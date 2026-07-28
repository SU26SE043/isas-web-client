import { useCallback, useEffect, useState } from 'react';
import { getApiStatusCode } from '@/shared/api/apiError';
import { engagementService } from '../services/engagement.service';
import type { EngagementScope, NotificationPreferences, PlatformNotification, SupportTicket, SupportTicketInput, TeamInviteInput, TeamMember, TeamRole } from '../types/engagement.types';

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
  const [isMutating, setIsMutating] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setErrorKey(null);
    try {
      setTeam(await engagementService.listTeam());
    } catch {
      setErrorKey('engagement.team.error.load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invite = useCallback(async (input: TeamInviteInput) => {
    setIsMutating(true);
    setErrorKey(null);
    try {
      const member = await engagementService.inviteTeamMember(input);
      setTeam((current) => [member, ...current.filter((item) => item.userId !== member.userId)]);
    } catch (error) {
      setErrorKey(
        getApiStatusCode(error) === 409
          ? 'engagement.team.error.emailExists'
          : getApiStatusCode(error) === 403
            ? 'engagement.team.error.forbidden'
            : 'engagement.team.error.invite',
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const updateRole = useCallback(async (userId: string, orgRole: TeamRole) => {
    setIsMutating(true);
    setErrorKey(null);
    try {
      const member = await engagementService.updateTeamMemberRole(userId, { orgRole });
      setTeam((current) => current.map((item) => (item.userId === userId ? member : item)));
    } catch (error) {
      const status = getApiStatusCode(error);
      setErrorKey(
        status === 400
          ? 'engagement.team.error.invalidRole'
          : status === 403
            ? 'engagement.team.error.forbidden'
            : status === 404
              ? 'engagement.team.error.notFound'
              : status === 409
                ? 'engagement.team.error.lastAdmin'
                : 'engagement.team.error.update',
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { team, isLoading, isMutating, errorKey, invite, updateRole, reload };
}
