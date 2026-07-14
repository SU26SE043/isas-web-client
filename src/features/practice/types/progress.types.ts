export interface ProgressRoadmapCompletion {
  completed: number;
  inProgress: number;
  locked: number;
}

export interface ProgressSkillBreakdownItem {
  id: string;
  name: string;
  nameVi: string;
  completed: number;
  inProgress: number;
}

export interface ProgressPracticeScorePoint {
  id: string;
  sessionLabel: string;
  sessionLabelVi: string;
  score: number;
}

export interface ProgressMinimalDashboard {
  roadmapCompletion: ProgressRoadmapCompletion;
  skillBreakdown: ProgressSkillBreakdownItem[];
  practiceScores: ProgressPracticeScorePoint[];
}

export function getRoadmapCompletionPercent(completion: ProgressRoadmapCompletion): number {
  const total = completion.completed + completion.inProgress + completion.locked;
  if (total <= 0) return 0;
  return Math.round((completion.completed / total) * 100);
}
