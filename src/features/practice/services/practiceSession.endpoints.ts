export const practiceSessionEndpoints = {
  session: (sessionId: string) => `/api/v1/interview/sessions/${sessionId}`,
  start: (sessionId: string) => `/api/v1/interview/sessions/${sessionId}/start`,
  questions: (sessionId: string) => `/api/v1/interview/sessions/${sessionId}/questions`,
  uploadChunk: (sessionId: string) => `/api/v1/interview/sessions/${sessionId}/recordings/chunks`,
  complete: (sessionId: string) => `/api/v1/interview/sessions/${sessionId}/complete`,
  proctoring: (sessionId: string) => `/api/v1/interview/sessions/${sessionId}/proctoring-events`,
} as const;
