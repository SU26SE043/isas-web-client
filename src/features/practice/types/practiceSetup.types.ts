export type PracticeLevel = 'intern' | 'fresher' | 'junior' | 'middle' | 'senior';

export interface PracticeDomain {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
}

export interface PracticeRubricCriterion {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface PracticeSessionCreateInput {
  domainId: string;
  level: PracticeLevel;
  cvFileId?: string;
  questionCount: number;
  rubric: PracticeRubricCriterion[];
}

export interface PracticeSessionCreateResult {
  sessionId: string;
  title: string;
}

export interface GenerateRubricInput {
  domainId: string;
  level: PracticeLevel;
  cvFileId?: string;
}
