export type AdminCampaignStatus = 'Draft' | 'Active' | 'Closed' | 'Archived';

export type AdminCampaignListItem = {
  id: string;
  title: string;
  status: AdminCampaignStatus;
  orgId?: string | null;
  organizationName?: string | null;
  domain?: string | null;
  maxCandidates?: number | null;
  totalCandidates?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type GetAdminCampaignsParams = {
  status?: AdminCampaignStatus;
  orgId?: string;
  cursor?: string;
  limit?: number;
};

export type AdminCampaignPage = {
  items: AdminCampaignListItem[];
  nextCursor: string | null;
};

export type AdminCampaignStatusFilter = 'all' | AdminCampaignStatus;
