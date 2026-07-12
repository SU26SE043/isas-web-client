import type { AdminPlatformSnapshot } from '../types/admin.types';

export const ADMIN_PLATFORM_FIXTURE: AdminPlatformSnapshot = {
  metrics: [
    { id: 'tenants', labelKey: 'admin.metric.tenants', value: '128', hintKey: 'admin.metric.tenantsHint', status: 'active' },
    { id: 'admins', labelKey: 'admin.metric.adminSessions', value: '1', hintKey: 'admin.metric.adminSessionsHint', status: 'healthy' },
    { id: 'audit', labelKey: 'admin.metric.auditIntegrity', value: '100%', hintKey: 'admin.metric.auditIntegrityHint', status: 'healthy' },
    { id: 'sla', labelKey: 'admin.metric.sla', value: '99.98%', hintKey: 'admin.metric.slaHint', status: 'warning' },
  ],
  users: [
    { id: 'usr_001', name: 'An Nguyen', email: 'an@pipraint.local', role: 'candidate', tenant: 'Public', status: 'active', mfaEnabled: false, lastSeenAt: '2026-07-12T02:05:00.000Z' },
    { id: 'usr_002', name: 'Mai Tran', email: 'mai@novaworks.ai', role: 'hr', tenant: 'NovaWorks AI', status: 'pending', mfaEnabled: true, lastSeenAt: '2026-07-11T09:40:00.000Z' },
    { id: 'usr_003', name: 'Long Pham', email: 'long@pipraint.local', role: 'admin', tenant: 'Platform', status: 'active', mfaEnabled: true, lastSeenAt: '2026-07-12T03:12:00.000Z' },
  ],
  roles: [
    { id: 'role_admin', nameKey: 'admin.role.admin', descriptionKey: 'admin.role.adminHint', users: 4, permissions: ['users.manage', 'audit.view', 'config.sign'] },
    { id: 'role_org', nameKey: 'admin.role.organize', descriptionKey: 'admin.role.organizeHint', users: 36, permissions: ['tenant.manage', 'billing.manage'] },
    { id: 'role_hr', nameKey: 'admin.role.hr', descriptionKey: 'admin.role.hrHint', users: 214, permissions: ['campaign.manage', 'candidate.view'] },
  ],
  permissionGroups: [
    { id: 'identity', labelKey: 'admin.permission.identity', permissions: ['users.manage', 'roles.assign', 'impersonation.create'] },
    { id: 'operations', labelKey: 'admin.permission.operations', permissions: ['config.sign', 'flags.manage', 'maintenance.schedule'] },
    { id: 'compliance', labelKey: 'admin.permission.compliance', permissions: ['audit.view', 'export.create', 'reports.masked'] },
  ],
  auditLogs: [
    { id: 'aud_001', actor: 'Long Pham', actionKey: 'admin.audit.action.impersonation', target: 'usr_001', createdAt: '2026-07-12T02:35:00.000Z', hash: 'ad91...b742', severity: 'warning' },
    { id: 'aud_002', actor: 'System', actionKey: 'admin.audit.action.heartbeat', target: 'health:api', createdAt: '2026-07-12T02:34:50.000Z', hash: 'bb45...9e10', severity: 'healthy' },
    { id: 'aud_003', actor: 'Mai Tran', actionKey: 'admin.audit.action.config', target: 'ai.threshold', createdAt: '2026-07-11T15:10:00.000Z', hash: 'c201...0f31', severity: 'critical' },
  ],
  aiConfig: { model: 'isas-rubric-v3', passingThreshold: 72, biasGuard: true, maxSessionMinutes: 60, pendingDualSign: true },
  flags: [
    { id: 'flag_blind_hiring', name: 'blind_hiring_v2', tenant: 'NovaWorks AI', enabled: true, isolated: true },
    { id: 'flag_report_export', name: 'async_report_export', tenant: 'All tenants', enabled: false, isolated: true },
  ],
  health: [
    { id: 'api', nameKey: 'admin.health.api', status: 'healthy', latencyMs: 82, lastHeartbeatAt: '2026-07-12T03:14:10.000Z' },
    { id: 'ai', nameKey: 'admin.health.ai', status: 'warning', latencyMs: 420, lastHeartbeatAt: '2026-07-12T03:14:10.000Z' },
    { id: 'storage', nameKey: 'admin.health.storage', status: 'healthy', latencyMs: 118, lastHeartbeatAt: '2026-07-12T03:14:10.000Z' },
  ],
  maintenance: [
    { id: 'mnt_001', title: 'Database index rotation', startsAt: '2026-07-18T17:00:00.000Z', endsAt: '2026-07-18T18:00:00.000Z', status: 'scheduled' },
  ],
  resources: {
    approvals: [
      { id: 'ap_001', primary: 'NovaWorks AI HR', secondary: 'Employer verification', status: 'pending', owner: 'Mai Tran', updatedAt: '2026-07-11T12:00:00.000Z' },
    ],
    candidates: [
      { id: 'can_001', primary: 'An Nguyen', secondary: 'Candidate profile review', status: 'active', owner: 'Public', updatedAt: '2026-07-10T08:00:00.000Z' },
    ],
    campaigns: [
      { id: 'camp_001', primary: 'Senior Frontend Hiring', secondary: 'Moderation queue', status: 'pending', owner: 'NovaWorks AI', updatedAt: '2026-07-11T06:30:00.000Z' },
    ],
    content: [
      { id: 'cms_001', primary: 'Privacy policy', secondary: 'CMS page', status: 'active', owner: 'Platform', updatedAt: '2026-07-09T11:20:00.000Z' },
    ],
    learning: [
      { id: 'learn_001', primary: 'Interview basics', secondary: 'Learning module', status: 'active', owner: 'Learning Ops', updatedAt: '2026-07-08T10:45:00.000Z' },
    ],
    notificationTemplates: [
      { id: 'tpl_001', primary: 'Credit low', secondary: 'Email + in-app template', status: 'active', owner: 'Platform', updatedAt: '2026-07-08T13:25:00.000Z' },
    ],
    reports: [
      { id: 'rep_001', primary: 'Tenant usage export', secondary: 'Masked report catalog', status: 'active', owner: 'Compliance', updatedAt: '2026-07-07T09:15:00.000Z' },
    ],
    backups: [
      { id: 'bak_001', primary: 'Nightly backup', secondary: 'Encrypted snapshot', status: 'healthy', owner: 'System', updatedAt: '2026-07-12T01:00:00.000Z' },
    ],
    supportTickets: [
      { id: 'sup_001', primary: 'AI score appeal', secondary: 'Candidate report flagged', status: 'open', owner: 'Support', updatedAt: '2026-07-11T18:30:00.000Z' },
    ],
  },
};
