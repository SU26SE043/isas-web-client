export type TeamRole = 'HrMember' | 'OrgAdmin';

export interface TeamMember {
  userId: string;
  email: string;
  fullName: string;
  orgRole: TeamRole;
  joinedAt: string;
}

export interface TeamInviteInput {
  email: string;
  fullName: string;
}

export interface TeamRoleUpdateInput {
  orgRole: TeamRole;
}

export interface Organization {
  id: string;
  name: string;
  taxCode?: string;
  createdAt: string;
  memberCount: number;
}

export interface OrganizationUpdateInput {
  name?: string;
  taxCode?: string;
}
