import { mockDelay, usesMockData } from '@/shared/mock';
import { HELP_ARTICLES, MOCK_NOTIFICATIONS, MOCK_PREFERENCES, MOCK_TEAM, MOCK_TICKETS } from '../mocks/engagement.fixtures';
import type {
  EngagementScope,
  HelpArticle,
  NotificationPreferences,
  PlatformNotification,
  SupportTicket,
  SupportTicketInput,
  TeamInviteInput,
  TeamMember,
} from '../types/engagement.types';

let notifications = structuredClone(MOCK_NOTIFICATIONS);
let preferences = structuredClone(MOCK_PREFERENCES);
let tickets = structuredClone(MOCK_TICKETS);
let team = structuredClone(MOCK_TEAM);

function ensureMock() {
  if (!usesMockData('enterprise')) {
    throw new Error('Engagement APIs are not wired yet. Keep usesMockData("enterprise") true.');
  }
}

export const engagementService = {
  async listNotifications(scope: EngagementScope): Promise<PlatformNotification[]> {
    ensureMock();
    await mockDelay(180);
    return structuredClone(notifications.filter((item) => item.scope === scope));
  },

  async triggerNotification(scope: EngagementScope): Promise<PlatformNotification> {
    ensureMock();
    await mockDelay(450);
    const titleKey = 'engagement.notification.live.title';
    const bodyKey = 'engagement.notification.live.body';
    const dedupeWindowMs = 5 * 60 * 1000;
    const now = Date.now();
    const duplicate = notifications.find(
      (item) =>
        item.scope === scope
        && item.titleKey === titleKey
        && now - new Date(item.createdAt).getTime() < dedupeWindowMs,
    );
    if (duplicate) {
      return structuredClone(duplicate);
    }
    const notification: PlatformNotification = {
      id: `noti_live_${Date.now()}`,
      scope,
      category: scope === 'candidate' ? 'interview' : 'system',
      titleKey,
      bodyKey,
      createdAt: new Date().toISOString(),
      status: 'unread',
    };
    notifications = [notification, ...notifications];
    return structuredClone(notification);
  },

  async markAllRead(scope: EngagementScope): Promise<PlatformNotification[]> {
    ensureMock();
    await mockDelay(220);
    notifications = notifications.map((item) => (item.scope === scope ? { ...item, status: 'read' } : item));
    return this.listNotifications(scope);
  },

  async getPreferences(scope: EngagementScope): Promise<NotificationPreferences> {
    ensureMock();
    await mockDelay(160);
    return structuredClone(preferences[scope]);
  },

  async savePreferences(scope: EngagementScope, input: NotificationPreferences): Promise<NotificationPreferences> {
    ensureMock();
    await mockDelay(260);
    preferences = { ...preferences, [scope]: structuredClone(input) };
    return structuredClone(preferences[scope]);
  },

  async listHelp(scope: EngagementScope): Promise<HelpArticle[]> {
    ensureMock();
    await mockDelay(140);
    return structuredClone(HELP_ARTICLES.filter((article) => article.scope === scope || article.scope === 'all'));
  },

  async listTickets(scope: EngagementScope): Promise<SupportTicket[]> {
    ensureMock();
    await mockDelay(180);
    return structuredClone(tickets.filter((ticket) => ticket.scope === scope));
  },

  async createTicket(scope: EngagementScope, input: SupportTicketInput): Promise<SupportTicket> {
    ensureMock();
    await mockDelay(300);
    const ticket: SupportTicket = {
      id: `sup_${Date.now()}`,
      scope,
      subject: input.subject.trim(),
      priority: input.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    tickets = [ticket, ...tickets];
    return structuredClone(ticket);
  },

  async listTeam(): Promise<TeamMember[]> {
    ensureMock();
    await mockDelay(180);
    return structuredClone(team);
  },

  async inviteTeamMember(input: TeamInviteInput): Promise<TeamMember[]> {
    ensureMock();
    await mockDelay(300);
    team = [
      {
        id: `tm_${Date.now()}`,
        name: input.email.split('@')[0],
        email: input.email,
        role: input.role,
        status: 'invited',
        lastActiveAt: new Date().toISOString(),
      },
      ...team,
    ];
    return structuredClone(team);
  },
};
