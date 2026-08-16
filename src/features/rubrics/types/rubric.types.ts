import type { JobCategoryEnum } from '@/shared/domain/jobDomains';

export type JobCategory = JobCategoryEnum;
export type RubricLanguage = 'vi' | 'en';

export type RubricLevel = {
  score: number;
  descriptor: string;
};

export type RubricCriterionResponse = {
  id: string;
  name: string;
  description?: string | null;
  weight: number;
  maxScore: number;
  /**
   * Mốc điểm (thang neo) do ADMIN soạn — màn này KHÔNG sửa chúng, chỉ mang đi mang về.
   * Optional vì server bản cũ không trả field này.
   */
  levels?: RubricLevel[] | null;
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
  /** Mốc điểm nhận từ server, giữ nguyên để gửi lại. Xem `mapEditableToUpdateRequest`. */
  levels?: RubricLevel[];
  /** `maxScore` lúc NHẬN — dùng để biết `levels` còn khớp thang điểm không. */
  originalMaxScore?: number;
};

export type UpdateRubricRequest = {
  criteria: Array<{
    name: string;
    description?: string | null;
    weight: number;
    maxScore: number;
    levels?: RubricLevel[];
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
