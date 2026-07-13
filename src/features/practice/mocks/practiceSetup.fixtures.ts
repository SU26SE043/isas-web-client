import type { PracticeDomain, PracticeLevel, PracticeRubricCriterion } from '../types/practiceSetup.types';

export const PRACTICE_LEVELS: PracticeLevel[] = ['intern', 'fresher', 'junior', 'middle', 'senior'];

export const PRACTICE_QUESTION_COUNTS = [3, 5, 7, 10] as const;

export const PRACTICE_DOMAINS: PracticeDomain[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    nameVi: 'Phát triển Frontend',
    description: 'UI engineering, React, accessibility, and web performance.',
    descriptionVi: 'Kỹ thuật UI, React, accessibility và hiệu năng web.',
  },
  {
    id: 'backend',
    name: 'Backend Development',
    nameVi: 'Phát triển Backend',
    description: 'API design, databases, distributed systems, and reliability.',
    descriptionVi: 'Thiết kế API, cơ sở dữ liệu, hệ thống phân tán và độ tin cậy.',
  },
  {
    id: 'fullstack',
    name: 'Full-stack Development',
    nameVi: 'Phát triển Full-stack',
    description: 'End-to-end product delivery across client and server layers.',
    descriptionVi: 'Triển khai sản phẩm end-to-end trên client và server.',
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    nameVi: 'Phát triển Mobile',
    description: 'Native and cross-platform mobile application engineering.',
    descriptionVi: 'Kỹ thuật ứng dụng mobile native và đa nền tảng.',
  },
  {
    id: 'data',
    name: 'Data Engineering',
    nameVi: 'Kỹ thuật Dữ liệu',
    description: 'Pipelines, warehousing, analytics, and data quality.',
    descriptionVi: 'Pipeline, kho dữ liệu, phân tích và chất lượng dữ liệu.',
  },
  {
    id: 'qa',
    name: 'QA / Testing',
    nameVi: 'QA / Kiểm thử',
    description: 'Test strategy, automation, and release quality gates.',
    descriptionVi: 'Chiến lược kiểm thử, tự động hóa và cổng chất lượng phát hành.',
  },
];

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
