export interface InterviewHistoryItem {
  id: string;
  jobTitle: string;
  company: string;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  overallScore: number;
  duration: number; // in minutes
}

export interface InterviewHistoryResponse {
  interviews: InterviewHistoryItem[];
  total: number;
}