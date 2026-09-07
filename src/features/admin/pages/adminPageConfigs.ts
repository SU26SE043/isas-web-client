import type { AdminResourceKey } from '../types/admin.types';

export interface AdminResourceConfig {
  key: AdminResourceKey;
  screenId: string;
  titleKey: string;
  descriptionKey: string;
  ruleKey: string;
}

export const ADMIN_RESOURCE_CONFIGS: Record<AdminResourceKey, AdminResourceConfig> = {
  approvals: {
    key: 'approvals',
    screenId: 'approvals',
    titleKey: 'admin.approvals.title',
    descriptionKey: 'admin.approvals.description',
    ruleKey: 'admin.approvals.rule',
  },
  candidates: {
    key: 'candidates',
    screenId: 'candidates',
    titleKey: 'admin.candidates.title',
    descriptionKey: 'admin.candidates.description',
    ruleKey: 'admin.candidates.rule',
  },
  campaigns: {
    key: 'campaigns',
    screenId: 'campaigns',
    titleKey: 'admin.campaigns.title',
    descriptionKey: 'admin.campaigns.description',
    ruleKey: 'admin.campaigns.rule',
  },
  content: {
    key: 'content',
    screenId: 'content',
    titleKey: 'admin.content.title',
    descriptionKey: 'admin.content.description',
    ruleKey: 'admin.content.rule',
  },
  learning: {
    key: 'learning',
    screenId: 'learning',
    titleKey: 'admin.learning.title',
    descriptionKey: 'admin.learning.description',
    ruleKey: 'admin.learning.rule',
  },
  notificationTemplates: {
    key: 'notificationTemplates',
    screenId: 'notificationTemplates',
    titleKey: 'admin.templates.title',
    descriptionKey: 'admin.templates.description',
    ruleKey: 'admin.templates.rule',
  },
  reports: {
    key: 'reports',
    screenId: 'reports',
    titleKey: 'admin.reports.title',
    descriptionKey: 'admin.reports.description',
    ruleKey: 'admin.reports.rule',
  },
  backups: {
    key: 'backups',
    screenId: 'backups',
    titleKey: 'admin.backups.title',
    descriptionKey: 'admin.backups.description',
    ruleKey: 'admin.backups.rule',
  },
  supportTickets: {
    key: 'supportTickets',
    screenId: 'supportTickets',
    titleKey: 'admin.support.title',
    descriptionKey: 'admin.support.description',
    ruleKey: 'admin.support.rule',
  },
};
