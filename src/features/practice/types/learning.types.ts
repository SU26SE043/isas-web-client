export type LearningModuleStatus = 'not_started' | 'in_progress' | 'completed';

export interface RoadmapStep {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  skillTag: string;
  skillTagVi: string;
  estimatedWeeks: number;
  moduleId?: string;
  completed: boolean;
}

export interface LearningModule {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  skillTag: string;
  skillTagVi: string;
  durationMinutes: number;
  progressPercent: number;
  status: LearningModuleStatus;
  passThreshold: number;
}

export interface LearningModuleContent {
  id: string;
  sections: LearningSection[];
}

export interface LearningSection {
  id: string;
  title: string;
  titleVi: string;
  body: string;
  bodyVi: string;
}

export interface CertificateRecord {
  id: string;
  title: string;
  titleVi: string;
  issuedAt: string;
  score: number;
  interviewId: string;
  candidateName: string;
}

export interface RoadmapResponse {
  steps: RoadmapStep[];
  regenerateCount: number;
  regenerateLimit: number;
}
