export const candidateRubricsEndpoints = {
  rubric: (jobCategory: string) => `/api/v1/interview/practice/rubrics/${jobCategory}`,
} as const;
