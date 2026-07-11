export interface CareerGoal {
  targetRole: string;
  targetIndustry: string;
  expectedSalary?: string;
  preferredLocation?: string;
  summary?: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  url?: string;
  techStack?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  website?: string;
  twitter?: string;
}

export interface CandidateProfile {
  careerGoal?: CareerGoal;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  certificates: Certificate[];
  portfolio: PortfolioProject[];
  socialLinks: SocialLinks;
}

export type ProfileSectionKey =
  | 'career-goal'
  | 'education'
  | 'experience'
  | 'skills'
  | 'certificates'
  | 'portfolio'
  | 'social';

export interface ProfileCompleteness {
  percent: number;
  meetsGate: boolean;
  sections: Record<ProfileSectionKey | 'basic', boolean>;
}

export interface DashboardSummary {
  profileCompleteness: number;
  recentInterviews: number;
  creditsRemaining: number;
  hasCv: boolean;
}
