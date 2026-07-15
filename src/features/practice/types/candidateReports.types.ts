export type CandidateReportCategory = 'interview' | 'learning' | 'cv';

export interface CandidateReportListItem {
  id: string;
  category: CandidateReportCategory;
  title: string;
  titleVi: string;
  subtitle?: string;
  subtitleVi?: string;
  href: string;
  createdAt: string;
  score?: number;
}

export interface CandidateReportsHub {
  interview: CandidateReportListItem[];
  learning: CandidateReportListItem[];
  cv: CandidateReportListItem[];
}
