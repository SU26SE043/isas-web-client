export interface InterviewHistoryItem {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  overallScore: number;
  duration: number;
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
