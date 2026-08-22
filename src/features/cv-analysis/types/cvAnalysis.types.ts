import type { CvAnalysisDomain } from './cvDomain.types';
import { domainToJobCategoryEnum } from '@/shared/domain/jobDomains';

export type FileParseStatus = 'pending' | 'completed' | 'failed' | 'done';
export type InterviewFileType = 'cv' | 'jd';
export type FileListParams = {
  fileType?: InterviewFileType;
  cursor?: string;
  limit?: number;
};

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
  updatedAt?: string;
  userId?: string;
  storagePath?: string;
  storageBucket?: string;
  parsedText?: string | null;
}

export interface FileRecordPage {
  items: FileRecord[];
  nextCursor: string | null;
}

export interface ReplaceFileResponse {
  message: string;
  parsedCv: Record<string, unknown> | null;
}

export interface JdMatch {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export interface Citation {
  chunkId: string;
  sourceUrl: string;
  sourceTitle: string;
}

export interface AnalysisCitation {
  chunkId: string;
  content: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
}

export interface JdRequirement {
  text: string;
  citations: Citation[];
}

export interface JdRequirementsResponse {
  mustHave: JdRequirement[];
  niceToHave: JdRequirement[];
}

export interface RequirementInput {
  text: string;
}

export interface LevelCount {
  total: number;
  strong: number;
  partial: number;
  weak: number;
}

export interface RequirementSummary {
  mustHave: LevelCount;
  niceToHave: LevelCount;
}

export type RequirementPriority = 'MustHave' | 'NiceToHave';
export type RequirementLevel = 'Strong' | 'Partial' | 'Weak';

export const NO_EVIDENCE = 'Không thấy bằng chứng';

export interface RequirementMatch {
  requirementId: string;
  text: string;
  priority: RequirementPriority;
  level: RequirementLevel;
  evidence: string;
  page: number | null;
  sectionTitle: string | null;
}

export interface CvSection {
  title: string;
  kind: string;
  startsWith: string;
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
  requirementSummary: RequirementSummary | null;
  mustHaveMatches: RequirementMatch[];
  niceToHaveMatches: RequirementMatch[];
  cvSections: CvSection[];
  citations: AnalysisCitation[];
  createdAt: string;
  /** Optional backend-derived level; absent on older analysis records. */
  currentLevel?: string | null;
}

export interface AnalyzeCvRequest {
  cvId: string;
  /** API `jobCategory` enum: FE · BE · BA */
  jobCategory: string;
  jdId?: string;
  jdText?: string;
  mustHave?: RequirementInput[];
  niceToHave?: RequirementInput[];
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
