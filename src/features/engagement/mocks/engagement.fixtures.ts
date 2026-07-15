import type { HelpArticle, NotificationPreferences, PlatformNotification, SupportTicket, TeamMember } from '../types/engagement.types';

export const MOCK_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'noti_048',
    scope: 'candidate',
    category: 'interview',
    titleKey: 'engagement.notification.noti048.title',
    bodyKey: 'engagement.notification.noti048.body',
    createdAt: '2026-07-12T04:00:00.000Z',
    status: 'unread',
  },
  {
    id: 'noti_084',
    scope: 'employer',
    category: 'billing',
    titleKey: 'engagement.notification.noti084.title',
    bodyKey: 'engagement.notification.noti084.body',
    createdAt: '2026-07-12T03:45:00.000Z',
    status: 'unread',
  },
  {
    id: 'noti_sys',
    scope: 'admin',
    category: 'system',
    titleKey: 'engagement.notification.system.title',
    bodyKey: 'engagement.notification.system.body',
    createdAt: '2026-07-12T03:30:00.000Z',
    status: 'read',
  },
];

export const MOCK_PREFERENCES: Record<string, NotificationPreferences> = {
  candidate: { email: true, inApp: true, marketing: false, quietHours: true, quietStart: '22:00', quietEnd: '07:00' },
  employer: { email: true, inApp: true, marketing: false, quietHours: true, quietStart: '21:00', quietEnd: '07:30' },
  admin: { email: true, inApp: true, marketing: false, quietHours: false, quietStart: '00:00', quietEnd: '00:00' },
};

export const HELP_ARTICLES: HelpArticle[] = [
  { id: 'help_candidate_1', scope: 'candidate', titleKey: 'engagement.help.article.practice.title', bodyKey: 'engagement.help.article.practice.body', categoryKey: 'engagement.help.category.interview' },
  { id: 'help_candidate_2', scope: 'candidate', titleKey: 'engagement.help.article.credits.title', bodyKey: 'engagement.help.article.credits.body', categoryKey: 'engagement.help.category.billing' },
  { id: 'help_employer_1', scope: 'employer', titleKey: 'engagement.help.article.campaign.title', bodyKey: 'engagement.help.article.campaign.body', categoryKey: 'engagement.help.category.campaign' },
  { id: 'help_all_1', scope: 'all', titleKey: 'engagement.help.article.support.title', bodyKey: 'engagement.help.article.support.body', categoryKey: 'engagement.help.category.support' },
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 'sup_1001', scope: 'candidate', subject: 'Interview report appeal', priority: 'normal', status: 'open', createdAt: '2026-07-10T09:00:00.000Z' },
  { id: 'sup_1002', scope: 'employer', subject: 'Webhook delivery failure', priority: 'high', status: 'pending', createdAt: '2026-07-11T15:30:00.000Z' },
];

export const MOCK_TEAM: TeamMember[] = [
  { id: 'tm_001', name: 'Mai Tran', email: 'mai@novaworks.ai', role: 'OrgAdmin', status: 'active', lastActiveAt: '2026-07-12T03:20:00.000Z' },
  { id: 'tm_002', name: 'Khoa Le', email: 'khoa@novaworks.ai', role: 'HrMember', status: 'active', lastActiveAt: '2026-07-11T12:00:00.000Z' },
  { id: 'tm_003', name: 'Hiring Ops', email: 'ops@novaworks.ai', role: 'HrMember', status: 'invited', lastActiveAt: '2026-07-09T08:30:00.000Z' },
];
