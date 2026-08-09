export const b2cPracticeSessionEndpoints = {
  sessions: '/api/v1/interview/practice/sessions',
  sessionOptions: '/api/v1/interview/practice/session-options',
  session: (sessionId: string) =>
    `/api/v1/interview/practice/sessions/${encodeURIComponent(sessionId)}`,
  speech: (sessionId: string, questionId: string) =>
    `/api/v1/interview/practice/sessions/${sessionId}/questions/${questionId}/speech`,
  answers: (sessionId: string) => `/api/v1/interview/practice/sessions/${sessionId}/answers`,
  answerAudio: (sessionId: string, answerId: string) =>
    `/api/v1/interview/practice/sessions/${sessionId}/answers/${answerId}/audio`,
  submit: (sessionId: string) => `/api/v1/interview/practice/sessions/${sessionId}/submit`,
  history: '/api/v1/interview/practice/sessions/history',
} as const;
