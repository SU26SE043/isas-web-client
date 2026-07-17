/**
 * Canonical job domains for the whole product (CV analysis, practice, roadmap).
 * CV analysis API expects `jobCategory` as the English name (Frontend / Backend / Business Analyst).
 * `jobCategoryCode` 1|2|3 is retained for any legacy callers.
 */
export const JOB_DOMAIN_IDS = ['frontend', 'backend', 'business-analyst'] as const;

export type JobDomainId = (typeof JOB_DOMAIN_IDS)[number];

export type JobCategoryCode = 1 | 2 | 3;

export interface JobDomainDefinition {
  id: JobDomainId;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  /** Campaign analyze API integer: FE=1, BE=2, BA=3 */
  jobCategoryCode: JobCategoryCode;
}

export const JOB_DOMAINS: readonly JobDomainDefinition[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    nameVi: 'Frontend',
    description: 'UI, React/Vue, browser performance, and user experience.',
    descriptionVi: 'UI, React/Vue, hiệu năng trình duyệt và trải nghiệm người dùng.',
    jobCategoryCode: 1,
  },
  {
    id: 'backend',
    name: 'Backend',
    nameVi: 'Backend',
    description: 'API design, databases, distributed systems, and reliability.',
    descriptionVi: 'Thiết kế API, cơ sở dữ liệu, hệ thống phân tán và độ tin cậy.',
    jobCategoryCode: 2,
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    nameVi: 'Business Analyst',
    description: 'Requirements, process mapping, stakeholders, and solution analysis.',
    descriptionVi: 'Yêu cầu nghiệp vụ, quy trình, stakeholder và phân tích giải pháp.',
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
