import { CV_ANALYSIS_DOMAIN_KEY } from '@/features/cv-analysis/hooks/useCvAnalysisFlow';
import { domainToJobCategoryEnum, isJobDomainId } from '@/shared/domain/jobDomains';
import type {
  EditableRubricCriterion,
  JobCategory,
  RubricResponse,
  UpdateRubricRequest,
} from '../types/rubric.types';

let tempCriterionCounter = 0;

export function getInitialJobCategory(): JobCategory {
  if (typeof window === 'undefined') return 'FE';
  const stored = localStorage.getItem(CV_ANALYSIS_DOMAIN_KEY);
  if (isJobDomainId(stored)) return domainToJobCategoryEnum(stored);
  return 'FE';
}

export function mapResponseToEditable(response: RubricResponse): EditableRubricCriterion[] {
  return response.criteria.map((criterion) => ({
    clientId: criterion.id,
    serverId: criterion.id,
    name: criterion.name,
    description: criterion.description ?? '',
    weightPercent: Math.round(criterion.weight * 10000) / 100,
    maxScore: criterion.maxScore,
  }));
}

export function mapEditableToUpdateRequest(criteria: EditableRubricCriterion[]): UpdateRubricRequest {
  return {
    criteria: criteria.map((criterion) => ({
      name: criterion.name.trim(),
      description: criterion.description.trim() || null,
      weight: criterion.weightPercent / 100,
      maxScore: criterion.maxScore,
    })),
  };
}

export function createEmptyCriterion(): EditableRubricCriterion {
  tempCriterionCounter += 1;
  return {
    clientId: `new-${Date.now()}-${tempCriterionCounter}`,
    name: '',
    description: '',
    weightPercent: 0,
    maxScore: 10,
  };
}

export function serializeCriteria(criteria: EditableRubricCriterion[]): string {
  return JSON.stringify(criteria);
}
