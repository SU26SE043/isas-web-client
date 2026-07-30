import type { CampaignInvitation } from '../types/campaign.api.types';
import type { CampaignCandidateRow, CampaignQuestion, CampaignProctoringConfig, EmployerCampaign } from '../types/campaignManagement.types';

export const DEFAULT_PROCTORING: CampaignProctoringConfig = {
  faceCaptureIntervalSeconds: 90,
  faceSimilarityThreshold: 0.75,
  maxViolations: 3,
};

export const QUESTION_BANK: CampaignQuestion[] = [
  {
    id: 'q-react-state',
    prompt: 'Explain how you would manage server and client state in a React assessment dashboard.',
    skill: 'React',
    difficulty: 'middle',
    source: 'ai',
    isRequired: true,
  },
  {
    id: 'q-api-contract',
    prompt: 'Design an API contract for a paginated candidate ranking table.',
    skill: 'API Design',
    difficulty: 'senior',
    source: 'ai',
    isRequired: true,
  },
  {
    id: 'q-sql-funnel',
    prompt: 'Write a query to calculate pass-through rate by campaign stage.',
    skill: 'SQL',
    difficulty: 'middle',
    source: 'ai',
    isRequired: true,
  },
  {
    id: 'q-test-plan',
    prompt: 'Create a Playwright test plan for a multi-step campaign wizard.',
    skill: 'Testing',
    difficulty: 'middle',
    source: 'ai',
    isRequired: true,
  },
];

export const DEFAULT_RUBRIC = [
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
    name: 'Delivery readiness',
    weight: 20,
    description: 'Pragmatism, testing, and production judgment.',
    maxScore: 10,
  },
  {
    id: 'culture',
    name: 'Team fit',
    weight: 15,
    description: 'Collaboration and learning posture.',
    maxScore: 10,
  },
];

function seedCandidates(emails: string[]): CampaignCandidateRow[] {
  return emails.map((email) => {
    if (email === 'candidate@isas.dev') {
      return { email, displayName: 'E2E Candidate', candidateId: 'e2e-candidate', status: 'invited' };
    }
    if (email === 'mai.nguyen@example.com') {
      return { email, displayName: 'Mai Nguyen', candidateId: 'cand-mai', status: 'invited' };
    }
    return { email, status: 'invite_pending' };
  });
}

/** Sample invitation history for non-GUID / mock campaign ids (UI + local demo). */
export const MOCK_CAMPAIGN_INVITATIONS: CampaignInvitation[] = [
  {
    id: 'inv-queued-1',
    email: 'pending.send@example.com',
    status: 'Queued',
    createdAt: '2026-07-24T05:34:00.000Z',
    expiresAt: '2026-07-27T12:17:00.000Z',
    emailSentAt: null,
    joinedAt: null,
  },
  {
    id: 'inv-sent-1',
    email: 'sent.candidate@example.com',
    status: 'Sent',
    createdAt: '2026-07-23T08:10:00.000Z',
    expiresAt: '2026-07-27T12:17:00.000Z',
    emailSentAt: '2026-07-23T08:11:00.000Z',
    joinedAt: null,
  },
  {
    id: 'inv-joined-1',
    email: 'joined.one@example.com',
    status: 'Joined',
    createdAt: '2026-07-22T04:00:00.000Z',
    expiresAt: '2026-07-27T12:17:00.000Z',
    emailSentAt: '2026-07-22T04:01:00.000Z',
    joinedAt: '2026-07-22T10:20:00.000Z',
  },
  {
    id: 'inv-joined-2',
    email: 'joined.two@example.com',
    status: 'Joined',
    createdAt: '2026-07-21T09:00:00.000Z',
    expiresAt: '2026-07-27T12:17:00.000Z',
    emailSentAt: '2026-07-21T09:02:00.000Z',
    joinedAt: '2026-07-21T14:45:00.000Z',
  },
  {
    id: 'inv-joined-3',
    email: 'joined.three@example.com',
    status: 'Joined',
    createdAt: '2026-07-20T11:00:00.000Z',
    expiresAt: '2026-07-27T12:17:00.000Z',
    emailSentAt: '2026-07-20T11:05:00.000Z',
    joinedAt: '2026-07-20T16:10:00.000Z',
  },
  {
    id: 'inv-revoked-1',
    email: 'revoked.one@example.com',
    status: 'Revoked',
    createdAt: '2026-07-19T07:30:00.000Z',
    expiresAt: '2026-07-27T12:17:00.000Z',
    emailSentAt: '2026-07-19T07:31:00.000Z',
    joinedAt: null,
  },
  {
    id: 'inv-revoked-2',
    email: 'revoked.two@example.com',
    status: 'Revoked',
    createdAt: '2026-07-18T06:00:00.000Z',
    expiresAt: '2026-07-27T12:17:00.000Z',
    emailSentAt: null,
    joinedAt: null,
  },
];

export const MOCK_EMPLOYER_CAMPAIGNS: EmployerCampaign[] = [
  {
    id: 'frontend-engineer-remote',
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
    candidates: seedCandidates(['candidate@isas.dev', 'mai.nguyen@example.com']),
    proctoring: DEFAULT_PROCTORING,
    welcomeMessage: 'Welcome to the NovaWorks AI assessment.',
    completionMessage: 'Thank you for completing the interview.',
    createdAt: '2026-07-04T09:00:00.000Z',
    updatedAt: '2026-07-10T10:00:00.000Z',
  },
  {
    id: 'data-analyst-hybrid',
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
    candidates: [],
    proctoring: DEFAULT_PROCTORING,
    welcomeMessage: 'Chao mung ban den voi bai phong van AI.',
    completionMessage: 'Cam on ban da hoan thanh bai phong van.',
    createdAt: '2026-07-09T09:00:00.000Z',
    updatedAt: '2026-07-09T09:30:00.000Z',
  },
];
