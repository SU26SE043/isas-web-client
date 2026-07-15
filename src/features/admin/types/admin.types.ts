export type AdminResourceKey =
  | 'approvals'
  | 'candidates'
  | 'campaigns'
  | 'content'
  | 'learning'
  | 'notificationTemplates'
  | 'reports'
  | 'backups'
  | 'supportTickets';

export type AdminStatus = 'active' | 'pending' | 'suspended' | 'approved' | 'rejected' | 'open' | 'resolved' | 'healthy' | 'warning' | 'critical';

export interface AdminMetric {
  id: string;
  labelKey: string;
  value: string;
  hintKey: string;
  status: AdminStatus;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Candidate' | 'HrMember' | 'OrgAdmin' | 'Admin';
  tenant: string;
  status: AdminStatus;
  mfaEnabled: boolean;
  lastSeenAt: string;
}

export interface AdminRole {
  id: string;
  nameKey: string;
  descriptionKey: string;
  users: number;
  permissions: string[];
}

export interface AdminPermissionGroup {
  id: string;
  labelKey: string;
  permissions: string[];
}

export interface AdminAuditLog {
  id: string;
  actor: string;
  actionKey: string;
  target: string;
  createdAt: string;
  hash: string;
  severity: AdminStatus;
}

export interface AdminAiConfig {
  model: string;
  passingThreshold: number;
  biasGuard: boolean;
  maxSessionMinutes: number;
  pendingDualSign: boolean;
}

export interface AdminFeatureFlag {
  id: string;
  name: string;
  tenant: string;
  enabled: boolean;
  isolated: boolean;
}

export interface AdminHealthCheck {
  id: string;
  nameKey: string;
  status: AdminStatus;
  latencyMs: number;
  lastHeartbeatAt: string;
}

export interface AdminMaintenanceWindow {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  status: 'scheduled' | 'draft' | 'completed';
}

export interface AdminTableRow {
  id: string;
  primary: string;
  secondary: string;
  status: AdminStatus;
  owner: string;
  updatedAt: string;
}

export interface AdminPlatformSnapshot {
  metrics: AdminMetric[];
  users: AdminUser[];
  roles: AdminRole[];
  permissionGroups: AdminPermissionGroup[];
  auditLogs: AdminAuditLog[];
  aiConfig: AdminAiConfig;
  flags: AdminFeatureFlag[];
  health: AdminHealthCheck[];
  maintenance: AdminMaintenanceWindow[];
  resources: Record<AdminResourceKey, AdminTableRow[]>;
}
