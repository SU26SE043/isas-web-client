export const learningEndpoints = {
  /** POST — create personalized practice roadmap (no credit charge). */
  createRoadmap: '/api/v1/interview/practice/roadmaps',
  /** GET — list roadmaps for the current candidate. */
  roadmaps: '/api/v1/interview/practice/roadmaps',
  /** GET — roadmap detail with milestones/lessons (ignore theoryContent for display). */
  roadmap: (id: string) => `/api/v1/interview/practice/roadmaps/${id}`,
  /** GET — open lesson; backend may generate theoryContent on first open. */
  lesson: (roadmapId: string, lessonId: string) =>
    `/api/v1/interview/practice/roadmaps/${roadmapId}/lessons/${lessonId}`,
  /** POST — mark theory done / start practice session (charges 1 credit). */
  startLesson: (roadmapId: string, lessonId: string) =>
    `/api/v1/interview/practice/roadmaps/${roadmapId}/lessons/${lessonId}/start`,
  /** GET — practice session detail (questions, progress). */
  practiceSession: (sessionId: string) => `/api/v1/interview/practice/sessions/${sessionId}`,
  /** POST — upload answer audio (multipart). */
  submitAnswer: (sessionId: string) =>
    `/api/v1/interview/practice/sessions/${sessionId}/answers`,
  /** GET — answer / progressive scoring result. */
  answer: (sessionId: string, answerId: string) =>
    `/api/v1/interview/practice/sessions/${sessionId}/answers/${answerId}`,
  /** GET — roadmap interim / snapshot report. */
  roadmapReport: (roadmapId: string) => `/api/v1/interview/practice/roadmaps/${roadmapId}/report`,
} as const;
