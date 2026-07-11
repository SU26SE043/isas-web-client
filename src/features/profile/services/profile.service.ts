import { mockDelay, usesMockData } from '@/shared/mock';
import { MOCK_CANDIDATE_PROFILE, MOCK_DASHBOARD_SUMMARY } from '../mocks/profile.fixtures';
import type {
  CandidateProfile,
  CareerGoal,
  Certificate,
  DashboardSummary,
  Education,
  Experience,
  PortfolioProject,
  Skill,
  SocialLinks,
} from '../types/profile.types';

let profileStore: CandidateProfile = structuredClone(MOCK_CANDIDATE_PROFILE);
let mockCreditsRemaining = MOCK_DASHBOARD_SUMMARY.creditsRemaining;
const reservedSessionCredits = new Set<string>();

function nextId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export const profileService = {
  async getProfile(): Promise<CandidateProfile> {
    if (!usesMockData('profile')) {
      throw new Error('Profile API is not wired yet. Keep usesMockData("profile") true.');
    }
    await mockDelay();
    return structuredClone(profileStore);
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    if (!usesMockData('profile')) {
      throw new Error('Profile API is not wired yet. Keep usesMockData("profile") true.');
    }
    await mockDelay();
    return { ...MOCK_DASHBOARD_SUMMARY, creditsRemaining: mockCreditsRemaining };
  },

  async reservePracticeCredit(sessionId: string): Promise<number> {
    if (!usesMockData('profile')) {
      throw new Error('Profile API is not wired yet. Keep usesMockData("profile") true.');
    }
    if (reservedSessionCredits.has(sessionId)) {
      return mockCreditsRemaining;
    }
    if (mockCreditsRemaining <= 0) {
      throw new Error('no_credits');
    }
    await mockDelay(200);
    mockCreditsRemaining -= 1;
    reservedSessionCredits.add(sessionId);
    return mockCreditsRemaining;
  },

  async updateCareerGoal(goal: CareerGoal): Promise<CandidateProfile> {
    if (!usesMockData('profile')) {
      throw new Error('Profile API is not wired yet. Keep usesMockData("profile") true.');
    }
    await mockDelay();
    profileStore = { ...profileStore, careerGoal: goal };
    return structuredClone(profileStore);
  },

  async addEducation(input: Omit<Education, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      education: [...profileStore.education, { ...input, id: nextId('edu') }],
    };
    return structuredClone(profileStore);
  },

  async updateEducation(id: string, input: Omit<Education, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      education: profileStore.education.map((item) => (item.id === id ? { ...input, id } : item)),
    };
    return structuredClone(profileStore);
  },

  async deleteEducation(id: string): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      education: profileStore.education.filter((item) => item.id !== id),
    };
    return structuredClone(profileStore);
  },

  async addExperience(input: Omit<Experience, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      experiences: [...profileStore.experiences, { ...input, id: nextId('exp') }],
    };
    return structuredClone(profileStore);
  },

  async updateExperience(id: string, input: Omit<Experience, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      experiences: profileStore.experiences.map((item) => (item.id === id ? { ...input, id } : item)),
    };
    return structuredClone(profileStore);
  },

  async deleteExperience(id: string): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      experiences: profileStore.experiences.filter((item) => item.id !== id),
    };
    return structuredClone(profileStore);
  },

  async updateSkills(skills: Skill[]): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = { ...profileStore, skills };
    return structuredClone(profileStore);
  },

  async addCertificate(input: Omit<Certificate, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      certificates: [...profileStore.certificates, { ...input, id: nextId('cert') }],
    };
    return structuredClone(profileStore);
  },

  async updateCertificate(id: string, input: Omit<Certificate, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      certificates: profileStore.certificates.map((item) => (item.id === id ? { ...input, id } : item)),
    };
    return structuredClone(profileStore);
  },

  async deleteCertificate(id: string): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      certificates: profileStore.certificates.filter((item) => item.id !== id),
    };
    return structuredClone(profileStore);
  },

  async addPortfolio(input: Omit<PortfolioProject, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      portfolio: [...profileStore.portfolio, { ...input, id: nextId('proj') }],
    };
    return structuredClone(profileStore);
  },

  async updatePortfolio(id: string, input: Omit<PortfolioProject, 'id'>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      portfolio: profileStore.portfolio.map((item) => (item.id === id ? { ...input, id } : item)),
    };
    return structuredClone(profileStore);
  },

  async deletePortfolio(id: string): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      portfolio: profileStore.portfolio.filter((item) => item.id !== id),
    };
    return structuredClone(profileStore);
  },

  async updateSocialLinks(links: SocialLinks): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = { ...profileStore, socialLinks: links };
    return structuredClone(profileStore);
  },

  async applyCvMapping(mapping: Partial<CandidateProfile>): Promise<CandidateProfile> {
    await mockDelay();
    profileStore = {
      ...profileStore,
      ...mapping,
      education: mapping.education ?? profileStore.education,
      experiences: mapping.experiences ?? profileStore.experiences,
      skills: mapping.skills ?? profileStore.skills,
      portfolio: mapping.portfolio ?? profileStore.portfolio,
      careerGoal: mapping.careerGoal ?? profileStore.careerGoal,
    };
    return structuredClone(profileStore);
  },
};
