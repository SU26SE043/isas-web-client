import type { PracticeDomain, PracticeRubricCriterion } from '../types/practiceSetup.types';
import { PRACTICE_LEVELS } from '@/shared/domain/practiceLevels';
import { JOB_DOMAINS } from '@/shared/domain/jobDomains';

export const PRACTICE_LEVELS_LIST = [...PRACTICE_LEVELS];

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

// Đúng BỐN cấp mà backend có (`RoadmapLevel { Fresher, Junior, Middle, Senior }`).
//
// Trước đây danh sách này có thêm 'intern' và 'lead', nhưng `resolveApiRoadmapLevel` nén chúng
// về Fresher/Senior TRONG IM LẶNG: người dùng chọn "Thực tập" và nhận về một lộ trình dán nhãn
// "Mới tốt nghiệp" — khác độ khó câu hỏi, khác độ sâu bài giảng, không một lời cảnh báo nào.
// Hai lựa chọn đó không phải tính năng, chúng là hai cái nút nói dối. Muốn có Intern/Lead thật
// thì phải thêm vào enum backend + ngưỡng + mô tả cấp độ trong prompt, không phải sửa ở đây.
export const ROADMAP_TARGET_LEVELS = [
  'fresher',
  'junior',
  'middle',
  'senior',
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
    maxScore: 10,
  },
  {
    id: 'communication',
    name: 'Communication',
    weight: 25,
    description: 'Clarity, structure, and tradeoff explanation.',
    maxScore: 10,
  },
  {
    id: 'delivery',
    name: 'Delivery',
    weight: 20,
    description: 'Confidence, pacing, and completeness of answers.',
    maxScore: 10,
  },
  {
    id: 'culture-fit',
    name: 'Culture fit',
    weight: 15,
    description: 'Collaboration mindset and ownership signals.',
    maxScore: 10,
  },
];
