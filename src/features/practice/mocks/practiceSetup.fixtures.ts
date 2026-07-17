import type { PracticeDomain, PracticeLevel, PracticeRubricCriterion } from '../types/practiceSetup.types';
import { JOB_DOMAINS } from '@/shared/domain/jobDomains';

export const PRACTICE_LEVELS: PracticeLevel[] = ['intern', 'fresher', 'junior', 'middle', 'senior'];

export const PRACTICE_QUESTION_COUNTS = [3, 5, 7, 10] as const;

/** Single domain list for practice interview + roadmap (Frontend / Backend / BA only). */
export const PRACTICE_DOMAINS: PracticeDomain[] = JOB_DOMAINS.map((domain) => ({
  id: domain.id,
  name: domain.name,
  nameVi: domain.nameVi,
  description: domain.description,
  descriptionVi: domain.descriptionVi,
}));

/** @deprecated Use PRACTICE_DOMAINS — same three domains project-wide. */
export const ROADMAP_DOMAINS: PracticeDomain[] = PRACTICE_DOMAINS;

export const ROADMAP_TARGET_LEVELS = [
  'intern',
  'fresher',
  'junior',
  'middle',
  'senior',
  'lead',
] as const;

export type RoadmapTargetLevel = (typeof ROADMAP_TARGET_LEVELS)[number];

/** Minimum completed reports required to create a roadmap; UI preview lists up to this many */
export const ROADMAP_MIN_REPORTS = 3;
export const ROADMAP_REPORT_PREVIEW_LIMIT = 3;

export const DEFAULT_PRACTICE_RUBRIC: PracticeRubricCriterion[] = [
  {
    id: 'technical-depth',
    name: 'Technical depth',
    weight: 40,
    description: 'Problem solving, architecture, and correctness.',
  },
  {
    id: 'communication',
    name: 'Communication',
    weight: 25,
    description: 'Clarity, structure, and tradeoff explanation.',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    weight: 20,
    description: 'Confidence, pacing, and completeness of answers.',
  },
  {
    id: 'culture-fit',
    name: 'Culture fit',
    weight: 15,
    description: 'Collaboration mindset and ownership signals.',
  },
];
