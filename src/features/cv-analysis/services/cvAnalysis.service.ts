import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_CV_ANALYSIS_RESULT, MOCK_UPLOADED_CV_FILES } from '../mocks/cvAnalysis.fixtures';
import type { CvAnalysisResult, SubmitCvAnalysisInput, UploadedCvFile } from '../types/cvAnalysis.types';
import type { CvAnalysisDomain } from '../types/cvDomain.types';

const UPLOADED_CV_STORAGE_KEY = 'isas-uploaded-cvs';
const MOCK_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

let lastSubmittedDomain: CvAnalysisDomain | null = null;

export class CvAnalysisError extends Error {
  readonly code: 'passwordProtected' | 'corruptFile' | 'parseFailed';

  constructor(code: 'passwordProtected' | 'corruptFile' | 'parseFailed', message?: string) {
    super(message ?? code);
    this.name = 'CvAnalysisError';
    this.code = code;
  }
}

function normalizeUploadedCv(file: UploadedCvFile): UploadedCvFile {
  return {
    ...file,
    pdfUrl: file.pdfUrl || MOCK_PDF_URL,
  };
}

function readUploadedCvStore(): UploadedCvFile[] {
  if (typeof sessionStorage !== 'undefined') {
    const raw = sessionStorage.getItem(UPLOADED_CV_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as UploadedCvFile[];
        return parsed.map(normalizeUploadedCv);
      } catch {
        sessionStorage.removeItem(UPLOADED_CV_STORAGE_KEY);
      }
    }
  }
  return structuredClone(MOCK_UPLOADED_CV_FILES);
}

function writeUploadedCvStore(files: UploadedCvFile[]) {
  uploadedCvStore = files;
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(UPLOADED_CV_STORAGE_KEY, JSON.stringify(files));
  }
}

let uploadedCvStore = readUploadedCvStore();

function detectMockFailure(file: File): CvAnalysisError | null {
  const name = file.name.toLowerCase();
  if (name.includes('locked') || name.includes('protected')) {
    return new CvAnalysisError('passwordProtected');
  }
  if (name.includes('corrupt') || name.includes('broken')) {
    return new CvAnalysisError('corruptFile');
  }
  return null;
}

function registerUploadedCv(file: File, analysisId: string): UploadedCvFile {
  const entry: UploadedCvFile = {
    id: `cv-file-${crypto.randomUUID().slice(0, 8)}`,
    fileName: file.name,
    fileSizeBytes: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
    pdfUrl: MOCK_PDF_URL,
    analysisId,
  };

  const existingIndex = uploadedCvStore.findIndex(
    (item) => item.fileName.toLowerCase() === entry.fileName.toLowerCase(),
  );
  const nextStore =
    existingIndex >= 0
      ? uploadedCvStore.map((item, index) => (index === existingIndex ? entry : item))
      : [entry, ...uploadedCvStore];

  writeUploadedCvStore(nextStore);
  return entry;
}

export const cvAnalysisService = {
  async submitAnalysis(input: SubmitCvAnalysisInput): Promise<{ analysisId: string }> {
    if (!usesMockData('cv-analysis')) {
      throw new Error('CV analysis API is not wired yet. Keep usesMockData("cv-analysis") true.');
    }

    const failure = detectMockFailure(input.file);
    if (failure) {
      throw failure;
    }

    await mockDelay(800);
    const analysisId = `cv-analysis-${crypto.randomUUID().slice(0, 8)}`;
    lastSubmittedDomain = input.domain;
    registerUploadedCv(input.file, analysisId);
    return { analysisId };
  },

  async listUploadedCvs(): Promise<UploadedCvFile[]> {
    if (!usesMockData('cv-analysis')) {
      throw new Error('CV analysis API is not wired yet. Keep usesMockData("cv-analysis") true.');
    }

    await mockDelay(250);
    return structuredClone(uploadedCvStore).map(normalizeUploadedCv);
  },

  async getAnalysisResult(analysisId?: string): Promise<CvAnalysisResult> {
    if (!usesMockData('cv-analysis')) {
      throw new Error('CV analysis API is not wired yet. Keep usesMockData("cv-analysis") true.');
    }

    if (!analysisId) {
      throw new CvAnalysisError('parseFailed');
    }

    await mockDelay(500);
    return {
      ...MOCK_CV_ANALYSIS_RESULT,
      id: analysisId,
      domain: lastSubmittedDomain ?? MOCK_CV_ANALYSIS_RESULT.domain,
    };
  },
};
