import type { CvAnalysisDomain } from './cvDomain.types';
import type { JobCategoryCode as SharedJobCategoryCode } from '@/shared/domain/jobDomains';
import { JOB_DOMAINS } from '@/shared/domain/jobDomains';

/** Numeric jobCategory sent to analyze API (FE=1, BE=2, BA=3). */
export type JobCategoryCode = SharedJobCategoryCode;

export const DOMAIN_TO_JOB_CATEGORY = Object.fromEntries(
  JOB_DOMAINS.map((domain) => [domain.id, domain.jobCategoryCode]),
) as Record<CvAnalysisDomain, JobCategoryCode>;


export type FileParseStatus = 'pending' | 'done' | 'failed';
export type CampaignFileType = 'cv' | 'jd';

/** Upload response from POST .../files/upload */
export interface FileRecord {
  id: string;
  fileType: CampaignFileType | string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  parseStatus: FileParseStatus | string;
  createdAt: string;
}

export interface JdMatch {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

/** Analyze + history item — render only API fields. */
export interface CvAnalysisResult {
  id: string;
  cvId: string;
  jdId: string | null;
  jobCategory: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  jdMatch: JdMatch | null;
  createdAt: string;
}

export interface AnalyzeCvRequest {
  cvId: string;
  jdId: string | null;
  jobCategory: JobCategoryCode;
}

/** Local UI attachment metadata (not computed scores). */
export interface AnalysisFileMeta {
  cvFileName?: string;
  jdFileName?: string | null;
}

/** Profile / practice list shape mapped from FileRecord. */
export interface UploadedCvFile {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
  pdfUrl: string;
  analysisId?: string;
}
