import { mockDelay, usesMockData } from '@/shared/mock';
import { paymentService } from '@/features/payment/services/payment.service';
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
let hasCvUploaded = MOCK_DASHBOARD_SUMMARY.hasCv;

function mergeByKey<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const seen = new Set(existing.map((item) => item.id));
  const merged = [...existing];
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      merged.push(item);
      seen.add(item.id);
    }
  }
  return merged;
}

function mergeSkills(existing: Skill[], incoming: Skill[]): Skill[] {
  const seen = new Set(existing.map((item) => item.name.toLowerCase()));
  const merged = [...existing];
  for (const item of incoming) {
    const key = item.name.toLowerCase();
    if (!seen.has(key)) {
      merged.push(item);
      seen.add(key);
    }
  }
  return merged;
}

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
    return {
      ...MOCK_DASHBOARD_SUMMARY,
      hasCv: hasCvUploaded,
      tokenBalance: paymentService.getBalance(),
      tokenReserved: paymentService.getReservedBalance(),
      tokenAvailable: paymentService.getAvailableBalance(),
      creditsRemaining: paymentService.getAvailableBalance(),
    };
  },

  async markCvUploaded(): Promise<void> {
    if (!usesMockData('profile')) return;
    hasCvUploaded = true;
  },

  async reservePracticeTokens(sessionId: string): Promise<number> {
    if (!usesMockData('profile')) {
      throw new Error('Profile API is not wired yet. Keep usesMockData("profile") true.');
    }
    const result = await paymentService.reserveTokens(sessionId);
    return result.wallet.available;
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

  async applyCvMapping(
    mapping: Partial<CandidateProfile>,
    options?: { merge?: boolean },
  ): Promise<CandidateProfile> {
    await mockDelay();
    const merge = options?.merge ?? true;

    profileStore = {
      ...profileStore,
      careerGoal: mapping.careerGoal ?? profileStore.careerGoal,
      socialLinks: mapping.socialLinks ?? profileStore.socialLinks,
      education: mapping.education
        ? merge
          ? mergeByKey(profileStore.education, mapping.education)
          : mapping.education
        : profileStore.education,
      experiences: mapping.experiences
        ? merge
          ? mergeByKey(profileStore.experiences, mapping.experiences)
          : mapping.experiences
        : profileStore.experiences,
      skills: mapping.skills
        ? merge
          ? mergeSkills(profileStore.skills, mapping.skills)
          : mapping.skills
        : profileStore.skills,
      portfolio: mapping.portfolio
        ? merge
          ? mergeByKey(profileStore.portfolio, mapping.portfolio)
          : mapping.portfolio
        : profileStore.portfolio,
      certificates: mapping.certificates
        ? merge
          ? mergeByKey(profileStore.certificates, mapping.certificates)
          : mapping.certificates
        : profileStore.certificates,
    };
    hasCvUploaded = true;
    return structuredClone(profileStore);
  },
};
