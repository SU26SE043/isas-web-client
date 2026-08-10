export interface CreateCampaignApiKeyRequest {
  name: string;
  expiresInDays?: number;
  includePii?: boolean;
}

export interface CreatedCampaignApiKey {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  includePii: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CampaignApiKeySummary {
  id: string;
  name: string;
  keyPrefix: string;
  includePii: boolean;
  isActive: boolean;
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

/** The v10 spec intentionally leaves the compact ATS campaign shape open. */
export type PublicCampaignSummary = Record<string, unknown>;
export type PublicCampaignResult = Record<string, unknown>;

export interface PublicCampaignResultsResponse {
  results: PublicCampaignResult[];
  piiIncluded: boolean;
}
