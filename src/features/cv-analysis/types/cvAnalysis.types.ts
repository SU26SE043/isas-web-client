import type { CvAnalysisDomain } from './cvDomain.types';
import { domainToJobCategoryEnum } from '@/shared/domain/jobDomains';

export type FileParseStatus = 'pending' | 'completed' | 'failed' | 'done';
export type InterviewFileType = 'cv' | 'jd';

/** Upload response from POST /api/v1/interview/files/upload */
export interface FileRecord {
  id: string;
  fileType: InterviewFileType | string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  /** Backend field: `parsedStatus` (completed|failed); legacy alias `parseStatus`. */
  parsedStatus: FileParseStatus | string;
  createdAt: string;
}

export interface JdMatch {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

/** Analyze + detail response — render only API fields. */
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
  /** API `jobCategory` enum: FE · BE · BA */
  jobCategory: string;
  jdId?: string;
  jdText?: string;
}

/** API list/detail response shape. */
export type CvAnalysisResponse = CvAnalysisResult;

export interface CvAnalysisPage {
  items: CvAnalysisResult[];
  nextCursor: string | null;
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

/** Map selected domain id → API `jobCategory` enum (FE / BE / BA). */
export function domainToJobCategoryLabel(domain: CvAnalysisDomain): string {
  return domainToJobCategoryEnum(domain);
}
