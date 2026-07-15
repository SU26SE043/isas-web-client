/**
 * Campaign CV Analysis — public gateway paths.
 *
 * Final URL = `${VITE_API_BASE_URL}` + path below.
 * `VITE_API_BASE_URL` must be origin only (e.g. `http://localhost:5050`), never `.../api`.
 *
 * Spec:
 * - POST /api/v1/campaign/api/files/upload?fileType=cv|jd
 * - POST /api/v1/campaign/api/practice/cv-analysis
 * - GET  /api/v1/campaign/api/practice/cv-analysis
 */
const CAMPAIGN_API_PREFIX = '/api/v1/campaign/api';

export const cvAnalysisEndpoints = {
  uploadFile: (fileType: 'cv' | 'jd') =>
    `${CAMPAIGN_API_PREFIX}/files/upload?fileType=${encodeURIComponent(fileType)}`,
  analyze: `${CAMPAIGN_API_PREFIX}/practice/cv-analysis`,
  listAnalyses: `${CAMPAIGN_API_PREFIX}/practice/cv-analysis`,
  getAnalysis: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/practice/cv-analysis/${encodeURIComponent(id)}`,
  /** Optional helpers when backend exposes file catalogue */
  listFiles: `${CAMPAIGN_API_PREFIX}/files`,
  getFile: (id: string) => `${CAMPAIGN_API_PREFIX}/files/${encodeURIComponent(id)}`,
  downloadFile: (id: string) =>
    `${CAMPAIGN_API_PREFIX}/files/${encodeURIComponent(id)}/download`,
} as const;
