/**
 * Interview CV Analysis — public gateway paths.
 *
 * Final URL = `${VITE_API_BASE_URL}` + path below.
 * `VITE_API_BASE_URL` must be origin only (e.g. `http://localhost:5050`), never `.../api`.
 *
 * Spec:
 * - POST /api/v1/interview/files/upload?fileType=cv|jd
 * - GET  /api/v1/interview/files/files
 * - POST /api/v1/interview/practice/jd-requirements
 * - PUT  /api/v1/interview/files/{id}
 * - DELETE /api/v1/interview/files/{id}
 * - GET  /api/v1/interview/files/{id}/download
 * - GET  /api/v1/interview/files/{id}/parsed-text
 * - POST /api/v1/interview/practice/cv-analysis
 * - GET  /api/v1/interview/practice/cv-analysis/{id}
 */
const INTERVIEW_API_PREFIX = '/api/v1/interview';

export const cvAnalysisEndpoints = {
  uploadFile: (fileType: 'cv' | 'jd') =>
    `${INTERVIEW_API_PREFIX}/files/upload?fileType=${encodeURIComponent(fileType)}`,
  jdRequirements: `${INTERVIEW_API_PREFIX}/practice/jd-requirements`,
  analyze: `${INTERVIEW_API_PREFIX}/practice/cv-analysis`,
  getAnalysis: (id: string) =>
    `${INTERVIEW_API_PREFIX}/practice/cv-analysis/${encodeURIComponent(id)}`,
  listAnalyses: `${INTERVIEW_API_PREFIX}/practice/cv-analysis`,
  listFiles: `${INTERVIEW_API_PREFIX}/files/files`,
  getFile: (id: string) => `${INTERVIEW_API_PREFIX}/files/${encodeURIComponent(id)}`,
  replaceFile: (id: string) => `${INTERVIEW_API_PREFIX}/files/${encodeURIComponent(id)}`,
  deleteFile: (id: string) => `${INTERVIEW_API_PREFIX}/files/${encodeURIComponent(id)}`,
  downloadFile: (id: string) =>
    `${INTERVIEW_API_PREFIX}/files/${encodeURIComponent(id)}/download`,
  parsedText: (id: string) =>
    `${INTERVIEW_API_PREFIX}/files/${encodeURIComponent(id)}/parsed-text`,
} as const;
