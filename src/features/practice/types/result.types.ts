export interface RadarData {
  subject: string;
  subjectVi: string;
  A: number; // Current Level (0-100)
  B: number; // Target Level (0-100)
  fullMark: number;
}

export interface GapAnalysisItem {
  id: string;
  skillName: string;
  skillNameVi: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  feedback: string;
  feedbackVi: string;
  actionableSteps: string[];
  actionableStepsVi: string[];
}

export interface InterviewResult {
  id: string;
  candidateId: string;
  overallScore: number;
  completedAt: string;
  summary: string;
  summaryVi: string;
  radarData: RadarData[];
  gapAnalysis: GapAnalysisItem[];
  strengths: string[];
  strengthsVi: string[];
  weaknesses: string[];
  weaknessesVi: string[];
}