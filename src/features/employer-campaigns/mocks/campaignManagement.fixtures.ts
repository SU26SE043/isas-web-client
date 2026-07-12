import type { CampaignQuestion, EmployerCampaign } from '../types/campaignManagement.types';

export const QUESTION_BANK: CampaignQuestion[] = [
  {
    id: 'q-react-state',
    prompt: 'Explain how you would manage server and client state in a React assessment dashboard.',
    skill: 'React',
    difficulty: 'middle',
  },
  {
    id: 'q-api-contract',
    prompt: 'Design an API contract for a paginated candidate ranking table.',
    skill: 'API Design',
    difficulty: 'senior',
  },
  {
    id: 'q-sql-funnel',
    prompt: 'Write a query to calculate pass-through rate by campaign stage.',
    skill: 'SQL',
    difficulty: 'middle',
  },
  {
    id: 'q-test-plan',
    prompt: 'Create a Playwright test plan for a multi-step campaign wizard.',
    skill: 'Testing',
    difficulty: 'middle',
  },
];

export const DEFAULT_RUBRIC = [
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
    name: 'Delivery readiness',
    weight: 20,
    description: 'Pragmatism, testing, and production judgment.',
  },
  {
    id: 'culture',
    name: 'Team fit',
    weight: 15,
    description: 'Collaboration and learning posture.',
  },
];

export const MOCK_EMPLOYER_CAMPAIGNS: EmployerCampaign[] = [
  {
    id: 'frontend-engineer-assessment',
    title: 'Frontend Engineer Assessment',
    company: 'NovaWorks AI',
    location: 'Ho Chi Minh City',
    mode: 'remote',
    status: 'active',
    summary: 'Screen React engineers for product analytics and assessment workflow work.',
    jobDescription: 'Own React surfaces, async state, accessibility, test automation, and API integration.',
    capacity: 80,
    applicants: 42,
    deadline: '2026-08-05',
    durationMinutes: 45,
    locale: 'en',
    rubric: DEFAULT_RUBRIC,
    questions: QUESTION_BANK.slice(0, 3),
    invitedEmails: ['candidate@isas.dev', 'mai.nguyen@example.com'],
    welcomeMessage: 'Welcome to the NovaWorks AI assessment.',
    completionMessage: 'Thank you for completing the interview.',
    createdAt: '2026-07-04T09:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
  },
  {
    id: 'data-analyst-screening-draft',
    title: 'Data Analyst Screening',
    company: 'NovaWorks AI',
    location: 'Da Nang',
    mode: 'hybrid',
    status: 'draft',
    summary: 'Draft campaign for analytics and dashboarding candidates.',
    jobDescription: 'Assess SQL, business insight, data storytelling, and dashboard quality.',
    capacity: 50,
    applicants: 0,
    deadline: '2026-08-18',
    durationMinutes: 35,
    locale: 'vi',
    rubric: DEFAULT_RUBRIC,
    questions: [QUESTION_BANK[2]],
    invitedEmails: [],
    welcomeMessage: 'Chao mung ban den voi bai phong van AI.',
    completionMessage: 'Cam on ban da hoan thanh bai phong van.',
    createdAt: '2026-07-09T09:00:00.000Z',
    updatedAt: '2026-07-09T09:30:00.000Z',
  },
];
