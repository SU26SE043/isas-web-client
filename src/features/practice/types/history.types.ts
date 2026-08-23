export type InterviewHistoryLevel =
  | 'intern'
  | 'fresher'
  | 'junior'
  | 'middle'
  | 'senior'
  | 'lead';

export interface InterviewHistoryItem {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  overallScore: number;
  duration: number;
  /** Practice setup domain id — used to filter roadmap report selection */
  domainId: string;
  level: InterviewHistoryLevel;
  deletedAt?: string | null;
  /** Live practice history fields (optional for mock/legacy rows). */
  jobCategory?: string | null;
  createdAt?: string | null;
  completedAt?: string | null;
  rawStatus?: string | null;
  overallScoreNullable?: number | null;
}

export interface InterviewHistoryQuery {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
  cursor?: string;
  status?: string;
  excludeCampaign?: boolean;
}

export interface InterviewHistoryResponse {
  interviews: InterviewHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  nextCursor?: string | null;
}

/** Live: GET /api/v1/interview/practice/sessions/history */
export type PracticeSessionHistoryItem = {
  id: string;
  status: string;
  jobCategory: string;
  createdAt: string;
  completedAt?: string | null;
  overallScore?: number | null;
  seniority?: string | null;
};

export type PracticeSessionHistoryPage = {
  items: PracticeSessionHistoryItem[];
  nextCursor: string | null;
};

export type GetPracticeSessionHistoryParams = {
  cursor?: string;
  limit?: number;
  status?: string;
  excludeCampaign?: boolean;
};

export type PracticeHistoryStatusGroup =
  | 'completed'
  | 'inProgress'
  | 'pendingScore'
  | 'failed'
  | 'unknown';

export type PracticeHistoryStatusFilter = 'all' | PracticeHistoryStatusGroup;
export type PracticeHistorySort = 'newest' | 'oldest' | 'scoreDesc' | 'scoreAsc';
