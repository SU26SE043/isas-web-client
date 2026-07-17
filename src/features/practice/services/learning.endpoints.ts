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
} as const;
