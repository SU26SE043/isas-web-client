export interface RepoJdMatch {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface RepoAnalysisResponse {
  id: string;
  repoUrl: string;
  repoOwner: string;
  repoName: string;
  jobCategory: string;
  primaryLanguage: string | null;
  stars: number;
  languages: Record<string, number>;
  summary: string;
  techStack: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  interviewTalkingPoints: string[];
  jdMatch: RepoJdMatch | null;
  commitSha: string | null;
  createdAt: string;
}

export interface CreateRepoAnalysisRequest {
  repoUrl: string;
  jobCategory: string;
  jdText?: string;
  jdId?: string;
}

export interface RepoAnalysisPage {
  items: RepoAnalysisResponse[];
  nextCursor: string | null;
}
