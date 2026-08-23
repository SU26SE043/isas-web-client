import axios from 'axios';
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
  RequirementMatch,
  RequirementSummary,
  ReplaceFileResponse,
  UploadedCvFile,
} from '../types/cvAnalysis.types';
import {
  buildCreateCvAnalysisRequest,
  CV_JD_TEXT_MAX_CHARS,
} from '../utils/buildCreateCvAnalysisRequest';
import { cvAnalysisEndpoints } from './cvAnalysis.endpoints';

/** AI extraction is user-facing and interactive — never let it hang (J21). */
export const JD_REQUIREMENTS_TIMEOUT_MS = 20_000;

/**
 * Opt out of the shared 429 auto-retry in `createApiClient`, which sleeps for
 * `Retry-After` (up to 60s) and replays the request before the caller ever sees
 * the error. That is right for background calls; it is wrong for a button the
 * user just pressed — the screen would freeze for 45 seconds and only then
 * report the rate limit, with no countdown and no way to fall back to typing
 * requirements by hand. Pre-setting the interceptor's own guard flag makes it
 * skip the retry for this request only; every other endpoint is unaffected.
 */
const SKIP_RATE_LIMIT_RETRY = { _rateLimitRetry: true } as const;

export type CvAnalysisErrorCode =
  | 'badRequest'
  | 'insufficientCredits'
  | 'forbidden'
  | 'notFound'
  | 'rateLimited'
  | 'aiBusy'
  | 'serverError'
  | 'uploadFailed'
  | 'timeout'
  | 'canceled'
  | 'parsePending'
  | 'parseFailed'
  | 'unknown';

export interface CvAnalysisErrorOptions {
  /**
   * Message taken from the response body only. `message` may hold transport
   * noise ("Request failed with status code 404"); this field never does, so
   * error mappers can show it without leaking axios strings into the UI (P1).
   */
  serverMessage?: string | null;
  /** Parsed from the `Retry-After` header (429) so the UI can count down. */
  retryAfterSeconds?: number | null;
}

export class CvAnalysisError extends Error {
  readonly code: CvAnalysisErrorCode;
  readonly status?: number;
  readonly serverMessage: string | null;
  readonly retryAfterSeconds: number | null;

  constructor(
    code: CvAnalysisErrorCode,
    message: string,
    status?: number,
    options: CvAnalysisErrorOptions = {},
  ) {
    super(message);
    this.name = 'CvAnalysisError';
    this.code = code;
    this.status = status;
    this.serverMessage = options.serverMessage ?? null;
    this.retryAfterSeconds = options.retryAfterSeconds ?? null;
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
    case 409:
      return 'parseFailed';
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

function isAbortError(error: unknown): boolean {
  if (axios.isCancel(error)) return true;
  if (error instanceof Error && (error.name === 'CanceledError' || error.name === 'AbortError')) {
    return true;
  }
  return axios.isAxiosError(error) && error.code === 'ERR_CANCELED';
}

function isTimeoutError(error: unknown): boolean {
  if (!axios.isAxiosError(error) || error.response) return false;
  return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
}

/** Message straight from the response body — never an axios/transport string. */
export function readServerMessage(error: unknown): string | null {
  if (!axios.isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  if (typeof data === 'string') return data.trim() || null;
  if (!data || typeof data !== 'object') return null;
  const body = data as Record<string, unknown>;
  for (const key of ['message', 'error', 'detail', 'title']) {
    const value = body[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function readHeaderValue(headers: unknown, name: string): string | null {
  if (!headers || typeof headers !== 'object') return null;
  const record = headers as Record<string, unknown> & { get?: (key: string) => unknown };
  const raw = typeof record.get === 'function'
    ? record.get(name) ?? record.get(name.toLowerCase())
    : record[name] ?? record[name.toLowerCase()];
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
}

/** `Retry-After` is either delta-seconds or an HTTP date; body wins when present. */
export function readRetryAfterSeconds(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  const data: unknown = error.response?.data;
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    const fromBody = Number(body.retryAfterSeconds ?? body.retryAfter);
    if (Number.isFinite(fromBody) && fromBody >= 0) return Math.ceil(fromBody);
  }
  const header = readHeaderValue(error.response?.headers, 'retry-after');
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.ceil(seconds);
  const timestamp = Date.parse(header);
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

function toCvAnalysisError(error: unknown, fallback: string): CvAnalysisError {
  if (error instanceof CvAnalysisError) return error;
  if (isAbortError(error)) {
    return new CvAnalysisError('canceled', 'Request canceled.');
  }
  if (isTimeoutError(error)) {
    return new CvAnalysisError('timeout', 'Request timed out.');
  }
  const status = getApiStatusCode(error);
  return new CvAnalysisError(statusToCode(status), getApiErrorMessage(error, fallback), status, {
    serverMessage: readServerMessage(error),
    retryAfterSeconds: readRetryAfterSeconds(error),
  });
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

/**
 * A `/jd-requirements` item. `jdQuote` is the verbatim JD sentence behind the
 * suggestion (BE-2); it stays `null` while the backend rolls out, and the UI
 * simply hides "Xem trong JD" instead of breaking.
 */
export interface JdRequirementSuggestion extends JdRequirement {
  jdQuote: string | null;
}

export interface JdRequirementSuggestions {
  mustHave: JdRequirementSuggestion[];
  niceToHave: JdRequirementSuggestion[];
}

function parseJdRequirement(raw: unknown): JdRequirementSuggestion {
  const data = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const quote = data.jdQuote ?? data.JdQuote;
  return {
    text: String(data.text ?? ''),
    citations: parseCitations(data.citations),
    jdQuote: typeof quote === 'string' && quote.trim() ? quote : null,
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
    // Trình độ NGHỀ NGHIỆP suy từ CV. Server trả ở CẢ list lẫn detail
    // (`CvAnalysisListResponse` / `CvAnalysisResponse`, cùng tập đóng
    // `Fresher|Junior|Middle|Senior`), nhưng trước đây parser bỏ qua ⇒ giá trị LUÔN
    // `undefined` ⇒ bước "Trình độ hiện tại" của wizard lộ trình luôn rơi về `Fresher`,
    // và chuỗi `currentLevel.fromCv` là copy không có đường nào hiển thị được.
    //
    // `null` là giá trị HỢP LỆ, không phải thiếu dữ liệu: CV không đủ căn cứ thì server
    // cố ý trả `null` (đo trên prod ~2/5 bản phân tích). Chuẩn hoá chuỗi rỗng về `null`
    // để phía tiêu thụ chỉ phải phân biệt "có" với "không", thay vì ba trạng thái.
    //
    // KHÔNG lọc theo tập giá trị ở đây: parser là tầng vận chuyển, nó phải nói đúng thứ
    // server gửi. Việc "giá trị này có hiển thị/gửi lại được không" là chính sách, thuộc
    // về nơi dùng (`useRoadmapWizardFlow`).
    currentLevel:
      typeof data.currentLevel === 'string' && data.currentLevel.trim()
        ? data.currentLevel.trim()
        : null,
  };
}

type FileRecordFallback = Partial<Pick<
  FileRecord,
  'fileType' | 'originalName' | 'mimeType' | 'fileSize' | 'parsedStatus' | 'createdAt'
>>;

function firstDefined(data: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null) return data[key];
  }
  return undefined;
}

function finiteFileSize(value: unknown, fallback = 0): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function validFileDate(value: unknown, fallback = ''): string {
  if (typeof value !== 'string' || !value.trim()) return fallback;
  return Number.isNaN(Date.parse(value)) ? fallback : value;
}

export function parseFileRecord(
  raw: unknown,
  fallback: FileRecordFallback = {},
): FileRecord {
  if (!raw || typeof raw !== 'object') {
    throw new CvAnalysisError('uploadFailed', 'Invalid upload response.');
  }
  const data = raw as Record<string, unknown>;
  const id = String(firstDefined(data, [
    'fileId', 'id', 'cvId', 'jdId',
    'FileId', 'Id', 'CvId', 'JdId',
  ]) ?? '');
  if (!id) {
    throw new CvAnalysisError('uploadFailed', 'Upload response missing file id.');
  }

  const fileSize = finiteFileSize(
    firstDefined(data, ['fileSize', 'fileSizeBytes', 'size', 'FileSize', 'FileSizeBytes', 'Size']),
    finiteFileSize(fallback.fileSize, 0),
  );
  const createdAtFallback = validFileDate(fallback.createdAt, '');
  const createdAt = validFileDate(
    firstDefined(data, ['createdAt', 'uploadedAt', 'CreatedAt', 'UploadedAt']),
    createdAtFallback,
  );

  return {
    id,
    fileType: String(firstDefined(data, ['fileType', 'FileType']) ?? fallback.fileType ?? ''),
    originalName: String(firstDefined(data, [
      'originalName', 'fileName', 'name', 'OriginalName', 'FileName', 'Name',
    ]) ?? fallback.originalName ?? 'file.pdf'),
    mimeType: String(firstDefined(data, ['mimeType', 'MimeType']) ?? fallback.mimeType ?? 'application/pdf'),
    fileSize,
    parsedStatus: String(firstDefined(data, [
      'parsedStatus', 'parseStatus', 'ParsedStatus', 'ParseStatus',
    ]) ?? fallback.parsedStatus ?? 'pending'),
    createdAt,
    updatedAt: typeof firstDefined(data, ['updatedAt', 'UpdatedAt']) === 'string'
      ? String(firstDefined(data, ['updatedAt', 'UpdatedAt']))
      : undefined,
    userId: typeof firstDefined(data, ['userId', 'UserId']) === 'string'
      ? String(firstDefined(data, ['userId', 'UserId']))
      : undefined,
    storagePath: typeof firstDefined(data, ['storagePath', 'StoragePath']) === 'string'
      ? String(firstDefined(data, ['storagePath', 'StoragePath']))
      : undefined,
    storageBucket: typeof firstDefined(data, ['storageBucket', 'StorageBucket']) === 'string'
      ? String(firstDefined(data, ['storageBucket', 'StorageBucket']))
      : undefined,
    parsedText: typeof firstDefined(data, ['parsedText', 'ParsedText']) === 'string'
      ? String(firstDefined(data, ['parsedText', 'ParsedText']))
      : null,
  };
}

export type ParsedTextResult =
  | { status: 'completed'; parsedText: string }
  | { status: 'pending' }
  | { status: 'failed' };

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
    return parseFileRecord(unwrapData(response.data), {
      fileType,
      originalName: file.name,
      mimeType: file.type || 'application/pdf',
      fileSize: file.size,
      createdAt: new Date().toISOString(),
    });
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
    items: unwrapList(response.data).map((item) => parseFileRecord(item)),
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
      // A cross-origin 502 without CORS headers is exposed to Axios as a
      // network error, so the browser cannot provide response.status. Treat
      // this specific analysis failure as an AI/gateway outage in the UI.
      if (axios.isAxiosError(error) && !error.response && error.code === 'ERR_NETWORK') {
        throw new CvAnalysisError('aiBusy', 'The CV analysis gateway is unavailable.', 502);
      }
      throw toCvAnalysisError(error, 'CV analysis failed.');
    }
  },

  /**
   * Extract requirements from a JD.
   *
   * `apiClient` sets no timeout, so without one a stalled AI call hangs the
   * step forever (J21). The caller can also abort through `signal` — pressing
   * "Tiếp tục" mid-extraction must move on, not wait.
   */
  async getJdRequirements(
    input: {
      jdId?: string | null;
      jdText?: string | null;
      jobCategory: string;
    },
    options: { signal?: AbortSignal; timeoutMs?: number } = {},
  ): Promise<JdRequirementSuggestions> {
    const jdText = input.jdText?.trim() ?? '';
    if (!input.jobCategory.trim()) {
      throw new CvAnalysisError('badRequest', 'Job category is required.', 400);
    }
    if (jdText.length > CV_JD_TEXT_MAX_CHARS) {
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
      const response = await apiClient.post<unknown>(cvAnalysisEndpoints.jdRequirements, body, {
        ...SKIP_RATE_LIMIT_RETRY,
        signal: options.signal,
        timeout: options.timeoutMs ?? JD_REQUIREMENTS_TIMEOUT_MS,
      });
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

  async getFileBlob(id: string): Promise<Blob> {
    try {
      const response = await apiClient.get<Blob>(cvAnalysisEndpoints.downloadFile(id), {
        responseType: 'blob',
      });
      return response.data.type === 'application/pdf'
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not preview file.');
    }
  },

  /**
   * Read the extracted text of an uploaded file.
   *
   * BE-1/B3 splits the states the old 422 hid: 200 done · 202 still parsing
   * (client may poll) · 409 parsing failed (stop polling, ask for pasted text).
   */
  async readParsedText(id: string): Promise<ParsedTextResult> {
    try {
      const response = await apiClient.get<unknown>(cvAnalysisEndpoints.parsedText(id), {
        validateStatus: (status) => (status >= 200 && status < 300) || status === 409,
      });
      if (response.status === 409) return { status: 'failed' };

      const data = unwrapData(response.data);
      const record = data && typeof data === 'object' ? data as Record<string, unknown> : {};
      const parsedStatus = typeof record.parsedStatus === 'string'
        ? record.parsedStatus.toLowerCase()
        : '';
      if (parsedStatus === 'failed') return { status: 'failed' };

      const parsedText = record.parsedText;
      if (typeof parsedText === 'string' && parsedText.length > 0) {
        return { status: 'completed', parsedText };
      }
      if (response.status === 202 || parsedStatus === 'pending' || parsedStatus === 'processing') {
        return { status: 'pending' };
      }
      if (typeof parsedText === 'string') {
        return { status: 'completed', parsedText };
      }
      throw new CvAnalysisError('unknown', 'Parsed text missing from response.');
    } catch (error) {
      throw toCvAnalysisError(error, 'Could not load parsed text.');
    }
  },

  /** Text-or-throw helper for callers that cannot render a pending state. */
  async getParsedText(id: string): Promise<string> {
    const result = await this.readParsedText(id);
    if (result.status === 'completed') return result.parsedText;
    if (result.status === 'pending') {
      throw new CvAnalysisError('parsePending', 'The file is still being parsed.', 202);
    }
    throw new CvAnalysisError('parseFailed', 'The file could not be parsed.', 409);
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
