import type { JobDomainId } from '@/shared/domain/jobDomains';
import { JOB_DOMAIN_IDS, isJobDomainId } from '@/shared/domain/jobDomains';

/** @deprecated Prefer `JobDomainId` from `@/shared/domain/jobDomains`. */
export type CvAnalysisDomain = JobDomainId;

export const CV_ANALYSIS_DOMAINS: readonly CvAnalysisDomain[] = JOB_DOMAIN_IDS;

export function isCvAnalysisDomain(value: string | null | undefined): value is CvAnalysisDomain {
  return isJobDomainId(value);
}
