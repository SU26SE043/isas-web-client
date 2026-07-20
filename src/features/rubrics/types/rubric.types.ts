import type { JobCategoryEnum } from '@/shared/domain/jobDomains';

export type JobCategory = JobCategoryEnum;

export type RubricCriterionResponse = {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  maxScore: number;
};

export type RubricResponse = {
  jobCategory: JobCategory;
  isCustom: boolean;
  criteria: RubricCriterionResponse[];
};

export type EditableRubricCriterion = {
  clientId: string;
  serverId?: string;
  name: string;
  description: string;
  weightPercent: number;
  maxScore: number;
};

export type UpdateRubricRequest = {
  criteria: Array<{
    name: string;
    description?: string | null;
    weight: number;
    maxScore: number;
  }>;
};

export type WeightStatus = 'under' | 'valid' | 'over';

export type RubricValidationCode =
  | 'empty'
  | 'missingName'
  | 'invalidMaxScore'
  | 'negativeWeight'
  | 'invalidWeight'
  | 'invalidTotalMaxScore';
