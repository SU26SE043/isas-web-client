export const practiceSetupEndpoints = {
  domains: '/api/v1/interview/practice/domains',
  levels: '/api/v1/interview/practice/levels',
  /** Saved/default rubric for the domain selected in wizard step 1 (`FE` | `BE` | `BA`). */
  rubric: (jobCategory: string, language: 'vi' | 'en' = 'vi') =>
    `/api/v1/interview/practice/rubrics/${encodeURIComponent(jobCategory)}?language=${encodeURIComponent(language)}`,
  createSession: '/api/v1/interview/practice/sessions',
} as const;
