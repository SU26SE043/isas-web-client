import type {
  CandidateProfile,
  ProfileCompleteness,
  ProfileSectionKey,
} from '../types/profile.types';

const SECTION_WEIGHTS: Record<ProfileSectionKey | 'basic', number> = {
  basic: 15,
  'career-goal': 10,
  education: 15,
  experience: 20,
  skills: 15,
  certificates: 10,
  portfolio: 10,
  social: 5,
};

const COMPLETENESS_GATE = 70;

function hasBasicInfo(_profile: CandidateProfile, user?: { fullName?: string; title?: string; location?: string }) {
  return Boolean(
    user?.fullName?.trim()
    && user?.title?.trim()
    && user?.location?.trim(),
  );
}

function hasCareerGoal(profile: CandidateProfile) {
  const goal = profile.careerGoal;
  return Boolean(goal?.targetRole?.trim() && goal?.targetIndustry?.trim());
}

function hasEducation(profile: CandidateProfile) {
  return profile.education.length > 0;
}

function hasExperience(profile: CandidateProfile) {
  return profile.experiences.length > 0;
}

function hasSkills(profile: CandidateProfile) {
  return profile.skills.length >= 3;
}

function hasCertificates(profile: CandidateProfile) {
  return profile.certificates.length > 0;
}

function hasPortfolio(profile: CandidateProfile) {
  return profile.portfolio.length > 0;
}

function hasSocialLinks(profile: CandidateProfile) {
  const links = profile.socialLinks;
  return Boolean(links.linkedin?.trim() || links.github?.trim() || links.website?.trim());
}

export function calculateProfileCompleteness(
  profile: CandidateProfile,
  user?: { fullName?: string; title?: string; location?: string },
): ProfileCompleteness {
  const sections: ProfileCompleteness['sections'] = {
    basic: hasBasicInfo(profile, user),
    'career-goal': hasCareerGoal(profile),
    education: hasEducation(profile),
    experience: hasExperience(profile),
    skills: hasSkills(profile),
    certificates: hasCertificates(profile),
    portfolio: hasPortfolio(profile),
    social: hasSocialLinks(profile),
  };

  const percent = Object.entries(sections).reduce((total, [key, complete]) => {
    if (!complete) return total;
    return total + SECTION_WEIGHTS[key as ProfileSectionKey | 'basic'];
  }, 0);

  return {
    percent,
    meetsGate: percent >= COMPLETENESS_GATE,
    sections,
  };
}

export const PROFILE_COMPLETENESS_GATE = COMPLETENESS_GATE;
