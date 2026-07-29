/**
 * Canonical job domains for the whole product (CV analysis, practice, roadmap).
 * CV analysis API `jobCategory` uses enum strings: FE · BE · BA.
 * `jobCategoryCode` 1|2|3 is retained for any legacy callers.
 */
export const JOB_DOMAIN_IDS = ['frontend', 'backend', 'business-analyst'] as const;

export type JobDomainId = (typeof JOB_DOMAIN_IDS)[number];

export type JobCategoryCode = 1 | 2 | 3;

export type JobCategoryEnum = 'FE' | 'BE' | 'BA';

export interface JobDomainDefinition {
  id: JobDomainId;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  /** API `jobCategory` enum sent to Interview CV analysis. */
  jobCategoryEnum: JobCategoryEnum;
  /** Campaign analyze API integer: FE=1, BE=2, BA=3 */
  jobCategoryCode: JobCategoryCode;
}

export const JOB_DOMAINS: readonly JobDomainDefinition[] = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    nameVi: 'Frontend Developer',
    description: 'UI, React/Vue, browser performance, and user experience.',
    descriptionVi: 'UI, React/Vue, hiệu năng trình duyệt và trải nghiệm người dùng.',
    jobCategoryEnum: 'FE',
    jobCategoryCode: 1,
  },
  {
    id: 'backend',
    name: 'Backend Developer',
    nameVi: 'Backend Developer',
    description: 'API design, databases, distributed systems, and reliability.',
    descriptionVi: 'Thiết kế API, cơ sở dữ liệu, hệ thống phân tán và độ tin cậy.',
    jobCategoryEnum: 'BE',
    jobCategoryCode: 2,
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    nameVi: 'Business Analyst',
    description: 'Requirements, process mapping, stakeholders, and solution analysis.',
    descriptionVi: 'Yêu cầu nghiệp vụ, quy trình, stakeholder và phân tích giải pháp.',
    jobCategoryEnum: 'BA',
    jobCategoryCode: 3,
  },
] as const;

export function isJobDomainId(value: string | null | undefined): value is JobDomainId {
  return value === 'frontend' || value === 'backend' || value === 'business-analyst';
}

export function getJobDomain(id: string | null | undefined): JobDomainDefinition | undefined {
  if (!isJobDomainId(id)) return undefined;
  return JOB_DOMAINS.find((domain) => domain.id === id);
}

export function domainToJobCategoryEnum(id: JobDomainId): JobCategoryEnum {
  return getJobDomain(id)?.jobCategoryEnum ?? 'FE';
}

export function resolveJobDomainFromCategory(
  value: string | null | undefined,
): JobDomainDefinition | undefined {
  if (!value) return undefined;
  const normalized = value.trim();
  const upper = normalized.toUpperCase();
  return (
    JOB_DOMAINS.find((domain) => domain.jobCategoryEnum === upper) ??
    JOB_DOMAINS.find(
      (domain) =>
        domain.id === normalized ||
        domain.name === normalized ||
        domain.nameVi === normalized,
    )
  );
}

/** Display label for API `jobCategory` (FE/BE/BA) or legacy full names. */
export function formatJobCategoryDisplay(
  value: string | null | undefined,
  locale: 'vi' | 'en' = 'en',
): string {
  const domain = resolveJobDomainFromCategory(value);
  if (!domain) return value?.trim() || '';
  return locale === 'vi' ? domain.nameVi : domain.name;
}
