import {
  JOB_DOMAINS,
  type JobCategoryEnum,
  type JobDomainId,
  getJobDomain,
} from './jobDomains';

/** Canonical career positions for CV analysis, practice, and roadmap flows. */
export const CAREER_POSITIONS = JOB_DOMAINS.map((domain) => ({
  value: domain.id,
  label: domain.name,
  labelVi: domain.nameVi,
  jobCategoryEnum: domain.jobCategoryEnum,
}));

export type CareerPositionValue = JobDomainId;

export function getCareerPositionLabel(
  value: string | null | undefined,
  locale: 'vi' | 'en' = 'en',
): string {
  const domain = getJobDomain(value) ?? getJobDomainFromEnum(value);
  if (!domain) return value?.trim() || '';
  return locale === 'vi' ? domain.nameVi : domain.name;
}

export function getJobDomainFromEnum(
  enumValue: string | null | undefined,
): (typeof JOB_DOMAINS)[number] | undefined {
  if (!enumValue) return undefined;
  const upper = enumValue.trim().toUpperCase();
  return JOB_DOMAINS.find((domain) => domain.jobCategoryEnum === upper);
}

export function careerPositionToJobCategoryEnum(id: JobDomainId): JobCategoryEnum {
  return getJobDomain(id)?.jobCategoryEnum ?? 'FE';
}

export function jobCategoryEnumToDomainId(enumValue: JobCategoryEnum): JobDomainId {
  const domain = getJobDomainFromEnum(enumValue);
  return domain?.id ?? 'frontend';
}
