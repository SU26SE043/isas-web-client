import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { downloadBlobAsFile } from '@/shared/utils/downloadBlob';
import type {
  AnalyzeCvRequest,
  AnalysisCitation,
  CvAnalysisResult,
  CvAnalysisPage,
  FileListParams,
  FileRecord,
  FileRecordPage,
  Citation,
  CvSection,
  JdMatch,
  JdRequirement,
  JdRequirementsResponse,
  RequirementMatch,
  RequirementSummary,
  ReplaceFileResponse,
  UploadedCvFile,
} from '../types/cvAnalysis.types';
import { buildCreateCvAnalysisRequest } from '../utils/buildCreateCvAnalysisRequest';
import { cvAnalysisEndpoints } from './cvAnalysis.endpoints';

export type CvAnalysisErrorCode =
  | 'badRequest'
  | 'insufficientCredits'
  | 'forbidden'
  | 'notFound'
  | 'rateLimited'
  | 'aiBusy'
  | 'serverError'
  | 'uploadFailed'
  | 'unknown';

export class CvAnalysisError extends Error {
  readonly code: CvAnalysisErrorCode;
  readonly status?: number;

  constructor(code: CvAnalysisErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'CvAnalysisError';
    this.code = code;
    this.status = status;
  }
}

function statusToCode(status?: number): CvAnalysisErrorCode {
  switch (status) {
    case 400:
      return 'badRequest';
    case 402:
      return 'insufficientCredits';
    case 403:
      return 'forbidden';
    case 404:
      return 'notFound';
    case 429:
      return 'rateLimited';
    case 500:
      return 'serverError';
    case 502:
      return 'aiBusy';
    default:
      return 'unknown';
  }
}

function toCvAnalysisError(error: unknown, fallback: string): CvAnalysisError {
  if (error instanceof CvAnalysisError) return error;
  const status = getApiStatusCode(error);
  return new CvAnalysisError(statusToCode(status), getApiErrorMessage(error, fallback), status);
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string');
}

function parseJdMatch(raw: unknown): JdMatch | null {
  if (raw == null) return null;
  if (typeof raw !== 'object') return null;
  const match = raw as Record<string, unknown>;
  const score = typeof match.score === 'number' ? match.score : Number(match.score);
  if (!Number.isFinite(score)) return null;
  return {
    score,
    matchedSkills: asStringArray(match.matchedSkills),
    missingSkills: asStringArray(match.missingSkills),
  };
}

function parseCitation(raw: unknown): Citation | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  return {
    chunkId: String(data.chunkId ?? ''),
    sourceUrl: String(data.sourceUrl ?? ''),
    sourceTitle: String(data.sourceTitle ?? ''),
  };
}

function parseCitations(raw: unknown): Citation[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseCitation).filter((item): item is Citation => item !== null);
}

function parseJdRequirement(raw: unknown): JdRequirement {
  const data = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  return {
    text: String(data.text ?? ''),
    citations: parseCitations(data.citations),
  };
}

function parseAnalysisCitation(raw: unknown): AnalysisCitation | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  return {
    chunkId: String(data.chunkId ?? ''),
    content: String(data.content ?? ''),
    sourceUrl: data.sourceUrl == null ? null : String(data.sourceUrl),
    sourceTitle: data.sourceTitle == null ? null : String(data.sourceTitle),
  };
}

function parseAnalysisCitations(raw: unknown): AnalysisCitation[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseAnalysisCitation).filter((item): item is AnalysisCitation => item !== null);
}

function parseRequirementSummary(raw: unknown): RequirementSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  const parseLevelCount = (value: unknown) => {
    const item = value && typeof value === 'object' ? value as Record<string, unknown> : {};
    return {
      total: Number(item.total ?? 0),
      strong: Number(item.strong ?? 0),
      partial: Number(item.partial ?? 0),
      weak: Number(item.weak ?? 0),
    };
  };
  return {
    mustHave: parseLevelCount(data.mustHave),
    niceToHave: parseLevelCount(data.niceToHave),
  };
}

function parseRequirementMatch(raw: unknown): RequirementMatch | null {
  if (!raw || typeof raw !== 'object') return null;
  const data = raw as Record<string, unknown>;
  return {
    requirementId: String(data.requirementId ?? ''),
    text: String(data.text ?? ''),
    priority: data.priority === 'NiceToHave' ? 'NiceToHave' : 'MustHave',
    level: data.level === 'Strong' || data.level === 'Partial' ? data.level : 'Weak',
    evidence: String(data.evidence ?? ''),
    page: data.page == null ? null : Number(data.page),
    sectionTitle: data.sectionTitle == null ? null : String(data.sectionTitle),
  };
}

function parseRequirementMatches(raw: unknown): RequirementMatch[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(parseRequirementMatch).filter((item): item is RequirementMatch => item !== null);
}

function parseCvSections(raw: unknown): CvSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    .map((item) => ({
      title: String(item.title ?? ''),
      kind: String(item.kind ?? ''),
      startsWith: String(item.startsWith ?? ''),
    }));
}

export function parseAnalysis(raw: unknown): CvAnalysisResult {
  if (!raw || typeof raw !== 'object') {
    throw new CvAnalysisError('unknown', 'Invalid analysis response.');
  }
  const data = raw as Record<string, unknown>;
  const id = String(data.id ?? '');
  const cvId = String(data.cvId ?? '');
  if (!id || !cvId) {
    throw new CvAnalysisError('unknown', 'Invalid analysis response.');
  }

  return {
    id,
    cvId,
    jdId: data.jdId == null || data.jdId === '' ? null : String(data.jdId),
    jobCategory: String(data.jobCategory ?? ''),
    summary: String(data.summary ?? ''),
    strengths: asStringArray(data.strengths),
    weaknesses: asStringArray(data.weaknesses),
    suggestions: asStringArray(data.suggestions),
    jdMatch: parseJdMatch(data.jdMatch),
    requirementSummary: parseRequirementSummary(data.requirementSummary),
    mustHaveMatches: parseRequirementMatches(data.mustHaveMatches),
    niceToHaveMatches: parseRequirementMatches(data.niceToHaveMatches),
    cvSections: parseCvSections(data.cvSections),
    citations: parseAnalysisCitations(data.citations),
    createdAt: String(data.createdAt ?? ''),
  };
}

function parseFileRecord(raw: unknown): FileRecord {
  if (!raw || typeof raw !== 'object') {
    throw new CvAnalysisError('uploadFailed', 'Invalid upload response.');
  }
  const data = raw as Record<string, unknown>;
  const id = String(data.fileId ?? data.id ?? data.cvId ?? data.jdId ?? '');
  if (!id) {
    throw new CvAnalysisError('uploadFailed', 'Upload response missing file id.');
  }

  return {
    id,
    fileType: String(data.fileType ?? ''),
    originalName: String(data.originalName ?? data.fileName ?? data.name ?? 'file.pdf'),
    mimeType: String(data.mimeType ?? 'application/pdf'),
    fileSize: typeof data.fileSize === 'number' ? data.fileSize : Number(data.fileSize ?? 0),
    parsedStatus: String(data.parsedStatus ?? data.parseStatus ?? 'pending'),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
    userId: typeof data.userId === 'string' ? data.userId : undefined,
    storagePath: typeof data.storagePath === 'string' ? data.storagePath : undefined,
    storageBucket: typeof data.storageBucket === 'string' ? data.storageBucket : undefined,
    parsedText: typeof data.parsedText === 'string' ? data.parsedText : null,
  };
}

/** Unwrap `{ data: T }` envelopes without treating `data: null` as missing payload root. */
function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const nested = (payload as { data: unknown }).data;
    if (nested !== undefined) return nested;
  }
  return payload;
}

function unwrapList(payload: unknown): unknown[] {
  const data = unwrapData(payload);
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items;
    if (Array.isArray(obj.results)) return obj.results;
  }
  return [];
}

function readNextCursor(headers: unknown): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const record = headers as Record<string, unknown> & { get?: (name: string) => unknown };
  const value = typeof record.get === 'function'
    ? record.get('x-next-cursor') ?? record.get('X-Next-Cursor')
    : record['x-next-cursor'] ?? record['X-Next-Cursor'];
  const cursor = Array.isArray(value) ? value[0] : value;
  return typeof cursor === 'string' && cursor.trim() ? cursor.trim() : null;
}

function toUploadedCvFile(record: FileRecord): UploadedCvFile {
  return {
    id: record.id,
    fileName: record.originalName,
    fileSizeBytes: record.fileSize,
    mimeType: record.mimeType,
    uploadedAt: record.createdAt,
    pdfUrl: cvAnalysisEndpoints.downloadFile(record.id),
  };
}

async function uploadPdf(file: File, fileType: 'cv' | 'jd'): Promise<FileRecord> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post<unknown>(cvAnalysisEndpoints.uploadFile(fileType), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return parseFileRecord(unwrapData(response.data));
  } catch (error) {
    throw toCvAnalysisError(error, 'File upload failed.');
  }
}

async function fetchFileRecordsPage(params?: FileListParams): Promise<FileRecordPage> {
  const response = await apiClient.get<unknown>(cvAnalysisEndpoints.listFiles, {
    params: {
      ...(params?.fileType ? { fileType: params.fileType } : {}),
      ...(params?.cursor ? { cursor: params.cursor } : {}),
      ...(params?.limit ? { limit: params.limit } : {}),
    },
  });
  return {
    items: unwrapList(response.data).map(parseFileRecord),
    nextCursor: readNextCursor(response.headers),
  };
}

/**
 * Live Interview CV Analysis API only — no mock fixtures.
 * Auth: Bearer token via `apiClient` interceptor (Candidate).
 */
export const cvAnalysisService = {
  async uploadCv(file: File): Promise<FileRecord> {
    return uploadPdf(file, 'cv');
  },

  async uploadJd(file: File): Promise<FileRecord> {
    return uploadPdf(file, 'jd');
  },

  async analyze(input: AnalyzeCvRequest): Promise<CvAnalysisResult> {
    try {
      const body = buildCreateCvAnalysisRequest(input);
      const response = await apiClient.post<unknown>(cvAnalysisEndpoints.analyze, body);
      return parseAnalysis(unwrapData(response.data));
    } catch (error) {
      if (error instanceof Error && error.message === 'CV_ID_REQUIRED') {
        throw new CvAnalysisError('badRequest', 'CV id is required.');
      }
      if (error instanceof Error && error.message === 'JOB_CATEGORY_REQUIRED') {
        throw new CvAnalysisError('badRequest', 'Job category is required.');
      }
      if (error instanceof Error && ['JD_TEXT_TOO_LONG', 'REQUIREMENT_LIMIT_EXCEEDED', 'REQUIREMENT_TEXT_TOO_LONG'].includes(error.message)) {
        throw new CvAnalysisError('badRequest', error.message);
      }
      throw toCvAnalysisError(error, 'CV analysis failed.');
    }
  },

  async getJdRequirements(input: {
    jdId?: string | null;
    jdText?: string | null;
    jobCategory: string;
  }): Promise<JdRequirementsResponse> {
    const jdText = input.jdText?.trim() ?? '';
    if (!input.jobCategory.trim()) {
      throw new CvAnalysisError('badRequest', 'Job category is required.', 400);
    }
    if (jdText.length > 20_000) {
      throw new CvAnalysisError('badRequest', 'JD text is too long.', 400);
    }
    const body: {
      jdText?: string;
      jdId?: string;
      jobCategory: string;
    } = {
      jobCategory: input.jobCategory.trim(),
    };
    if (jdText) body.jdText = jdText;
    else if (input.jdId?.trim()) body.jdId = input.jdId.trim();
    else throw new CvAnalysisError('badRequest', 'A JD text or id is required.', 400);

    try {
      const response = await apiClient.post<unknown>(cvAnalysisEndpoints.jdRequirements, body);
      const data = unwrapData(response.data);
      const record = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      return {
        mustHave: Array.isArray(record.mustHave) ? record.mustHave.map(parseJdRequirement) : [],
        niceToHave: Array.isArray(record.niceToHave) ? record.niceToHave.map(parseJdRequirement) : [],
      };
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not extract JD requirements.');
    }
  },

  /** Alias for create flow — POST /practice/cv-analysis */
  createAnalysis(input: AnalyzeCvRequest): Promise<CvAnalysisResult> {
    return this.analyze(input);
  },

  async listAnalysesPage(params?: { cursor?: string; limit?: number }): Promise<CvAnalysisPage> {
    try {
      const response = await apiClient.get<unknown>(cvAnalysisEndpoints.listAnalyses, {
        params: {
          ...(params?.cursor ? { cursor: params.cursor } : {}),
          ...(params?.limit ? { limit: params.limit } : {}),
        },
      });
      return {
        items: unwrapList(response.data).map(parseAnalysis),
        nextCursor: readNextCursor(response.headers),
      };
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load analysis history.');
    }
  },

  /** Backward-compatible first-page helper for existing report/history screens. */
  async listAnalyses(): Promise<CvAnalysisResult[]> {
    const page = await this.listAnalysesPage();
    return page.items;
  },

  async getAnalysisResult(analysisId?: string): Promise<CvAnalysisResult> {
    if (!analysisId) {
      throw new CvAnalysisError('badRequest', 'Missing analysis id.');
    }

    try {
      const response = await apiClient.get<unknown>(cvAnalysisEndpoints.getAnalysis(analysisId));
      return parseAnalysis(unwrapData(response.data));
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load analysis result.');
    }
  },

  async listFilesPage(params?: FileListParams): Promise<FileRecordPage> {
    try {
      return await fetchFileRecordsPage(params);
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load uploaded files.');
    }
  },

  /** Backward-compatible list helper; callers needing pagination should use listFilesPage. */
  async listFiles(params?: FileListParams): Promise<FileRecord[]> {
    const page = await this.listFilesPage(params);
    return page.items;
  },

  async listUploadedCvs(): Promise<UploadedCvFile[]> {
    try {
      const files = await this.listFiles({ fileType: 'cv' });
      return files
        .filter((file) => String(file.fileType).toLowerCase() === 'cv')
        .map(toUploadedCvFile);
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load uploaded CVs.');
    }
  },

  async downloadFile(id: string, originalName: string): Promise<void> {
    try {
      const response = await apiClient.get<Blob>(cvAnalysisEndpoints.downloadFile(id), {
        responseType: 'blob',
      });
      downloadBlobAsFile(response.data, originalName);
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not download file.');
    }
  },

  async getParsedText(id: string): Promise<string> {
    try {
      const response = await apiClient.get<unknown>(cvAnalysisEndpoints.parsedText(id));
      const data = unwrapData(response.data);
      const parsedText = data && typeof data === 'object'
        ? (data as Record<string, unknown>).parsedText
        : undefined;
      if (typeof parsedText !== 'string') {
        throw new CvAnalysisError('unknown', 'Parsed text missing from response.');
      }
      return parsedText;
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load parsed text.');
    }
  },

  async replaceFile(id: string, newFile: File): Promise<ReplaceFileResponse> {
    const formData = new FormData();
    formData.append('newFile', newFile);

    try {
      const response = await apiClient.put<unknown>(cvAnalysisEndpoints.replaceFile(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = unwrapData(response.data);
      const record = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      return {
        message: typeof record.message === 'string' ? record.message : 'Updated successfully',
        parsedCv: record.parsedCv && typeof record.parsedCv === 'object'
          ? record.parsedCv as Record<string, unknown>
          : null,
      };
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not replace file.');
    }
  },

  async deleteFile(id: string): Promise<void> {
    try {
      await apiClient.delete(cvAnalysisEndpoints.deleteFile(id));
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not delete file.');
    }
  },

  async getFile(id: string): Promise<FileRecord> {
    try {
      const response = await apiClient.get<unknown>(cvAnalysisEndpoints.getFile(id));
      return parseFileRecord(unwrapData(response.data));
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load file.');
    }
  },
};
