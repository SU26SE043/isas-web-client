import type { JobDomainId } from '@/shared/domain/jobDomains';
import type { PracticeLevel } from '@/shared/domain/practiceLevels';

export type { PracticeLevel };

export interface PracticeDomain {
  id: JobDomainId | string;
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
  /** API maxScore; required when saving via PUT. */
  maxScore: number;
}

export interface PracticeSessionCreateInput {
  domainId: string;
  /** API `level` enum: Fresher · Junior · Middle · Senior */
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
  /** Practice domain id from wizard step 1 (`frontend` | `backend` | `business-analyst`). */
  domainId: string;
}
