export type EngagementScope = 'candidate' | 'employer' | 'admin';
export type NotificationCategory = 'interview' | 'campaign' | 'billing' | 'system' | 'support';
export type NotificationStatus = 'unread' | 'read';
export type SupportPriority = 'low' | 'normal' | 'high';
export type SupportStatus = 'open' | 'pending' | 'resolved';
export type TeamRole = 'hr' | 'organize' | 'admin';

export interface PlatformNotification {
  id: string;
  scope: EngagementScope;
  category: NotificationCategory;
  titleKey: string;
  bodyKey: string;
  createdAt: string;
  status: NotificationStatus;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  marketing: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
}

export interface HelpArticle {
  id: string;
  scope: EngagementScope | 'all';
  titleKey: string;
  bodyKey: string;
  categoryKey: string;
}

export interface SupportTicket {
  id: string;
  scope: EngagementScope;
  subject: string;
  priority: SupportPriority;
  status: SupportStatus;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: 'active' | 'invited';
  lastActiveAt: string;
}

export interface SupportTicketInput {
  subject: string;
  description: string;
  priority: SupportPriority;
}

export interface TeamInviteInput {
  email: string;
  role: TeamRole;
}
