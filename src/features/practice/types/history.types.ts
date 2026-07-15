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
}

export interface InterviewHistoryQuery {
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface InterviewHistoryResponse {
  interviews: InterviewHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
}
