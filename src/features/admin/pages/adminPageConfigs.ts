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
    screenId: 'SCR-ADM-073',
    titleKey: 'admin.approvals.title',
    descriptionKey: 'admin.approvals.description',
    ruleKey: 'admin.approvals.rule',
  },
  candidates: {
    key: 'candidates',
    screenId: 'SCR-ADM-074',
    titleKey: 'admin.candidates.title',
    descriptionKey: 'admin.candidates.description',
    ruleKey: 'admin.candidates.rule',
  },
  campaigns: {
    key: 'campaigns',
    screenId: 'SCR-ADM-075',
    titleKey: 'admin.campaigns.title',
    descriptionKey: 'admin.campaigns.description',
    ruleKey: 'admin.campaigns.rule',
  },
  content: {
    key: 'content',
    screenId: 'SCR-ADM-076',
    titleKey: 'admin.content.title',
    descriptionKey: 'admin.content.description',
    ruleKey: 'admin.content.rule',
  },
  learning: {
    key: 'learning',
    screenId: 'SCR-ADM-077',
    titleKey: 'admin.learning.title',
    descriptionKey: 'admin.learning.description',
    ruleKey: 'admin.learning.rule',
  },
  notificationTemplates: {
    key: 'notificationTemplates',
    screenId: 'SCR-ADM-079',
    titleKey: 'admin.templates.title',
    descriptionKey: 'admin.templates.description',
    ruleKey: 'admin.templates.rule',
  },
  reports: {
    key: 'reports',
    screenId: 'SCR-ADM-080',
    titleKey: 'admin.reports.title',
    descriptionKey: 'admin.reports.description',
    ruleKey: 'admin.reports.rule',
  },
  backups: {
    key: 'backups',
    screenId: 'SCR-ADM-086',
    titleKey: 'admin.backups.title',
    descriptionKey: 'admin.backups.description',
    ruleKey: 'admin.backups.rule',
  },
  supportTickets: {
    key: 'supportTickets',
    screenId: 'SCR-ADM-088',
    titleKey: 'admin.support.title',
    descriptionKey: 'admin.support.description',
    ruleKey: 'admin.support.rule',
  },
};
