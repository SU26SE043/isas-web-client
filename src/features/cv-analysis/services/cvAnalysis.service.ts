import { apiClient } from '@/shared/api/apiClient';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { downloadBlobAsFile } from '@/shared/utils/downloadBlob';
import type {
  AnalyzeCvRequest,
  CvAnalysisResult,
  FileRecord,
  JdMatch,
  UploadedCvFile,
} from '../types/cvAnalysis.types';
import { buildCreateCvAnalysisRequest } from '../utils/buildCreateCvAnalysisRequest';
import { cvAnalysisEndpoints } from './cvAnalysis.endpoints';

export type CvAnalysisErrorCode =
  | 'badRequest'
  | 'insufficientCredits'
  | 'forbidden'
  | 'notFound'
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

function parseAnalysis(raw: unknown): CvAnalysisResult {
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

function fetchFileRecords(): Promise<FileRecord[]> {
  return apiClient
    .get<unknown>(cvAnalysisEndpoints.listFiles)
    .then((response) => unwrapList(response.data).map(parseFileRecord));
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
      throw toCvAnalysisError(error, 'CV analysis failed.');
    }
  },

  /** Alias for create flow — POST /practice/cv-analysis */
  createAnalysis(input: AnalyzeCvRequest): Promise<CvAnalysisResult> {
    return this.analyze(input);
  },

  async listAnalyses(): Promise<CvAnalysisResult[]> {
    try {
      const response = await apiClient.get<unknown>(cvAnalysisEndpoints.listAnalyses);
      return unwrapList(response.data).map(parseAnalysis);
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load analysis history.');
    }
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

  async listFiles(): Promise<FileRecord[]> {
    try {
      return await fetchFileRecords();
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load uploaded files.');
    }
  },

  async listUploadedCvs(): Promise<UploadedCvFile[]> {
    try {
      const files = await fetchFileRecords();
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

  async replaceFile(id: string, newFile: File): Promise<void> {
    const formData = new FormData();
    formData.append('newFile', newFile);

    try {
      await apiClient.put(cvAnalysisEndpoints.replaceFile(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
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
