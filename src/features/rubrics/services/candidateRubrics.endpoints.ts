export const candidateRubricsEndpoints = {
  rubric: (jobCategory: string, language: 'vi' | 'en' = 'vi') =>
    `/api/v1/interview/practice/rubrics/${encodeURIComponent(jobCategory)}?language=${encodeURIComponent(language)}`,
} as const;
