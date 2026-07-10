import type { CandidateProfile, DashboardSummary } from '../types/profile.types';

export const MOCK_CANDIDATE_PROFILE: CandidateProfile = {
  careerGoal: {
    targetRole: 'Senior Frontend Developer',
    targetIndustry: 'Technology',
    expectedSalary: '$80,000 - $100,000',
    preferredLocation: 'Ho Chi Minh City',
    summary: 'Build accessible, high-performance web products with React and TypeScript.',
  },
  education: [
    {
      id: 'edu-1',
      school: 'University of Engineering and Technology',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2014-09',
      endDate: '2018-06',
      isCurrent: false,
      description: 'Graduated with honors. Focus on software engineering and algorithms.',
    },
  ],
  experiences: [
    {
      id: 'exp-1',
      company: 'TechFlow Solutions',
      title: 'Senior Frontend Engineer',
      startDate: '2021-03',
      isCurrent: true,
      description: 'Lead UI architecture and mentor junior developers on modern React patterns.',
    },
    {
      id: 'exp-2',
      company: 'Global Soft Corp',
      title: 'Frontend Developer',
      startDate: '2018-07',
      endDate: '2021-02',
      isCurrent: false,
      description: 'Built responsive web applications for international banking clients.',
    },
  ],
  skills: [
    { id: 'skill-1', name: 'React', level: 'expert' },
    { id: 'skill-2', name: 'TypeScript', level: 'advanced' },
    { id: 'skill-3', name: 'Tailwind CSS', level: 'advanced' },
    { id: 'skill-4', name: 'Node.js', level: 'intermediate' },
  ],
  certificates: [
    {
      id: 'cert-1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      issueDate: '2023-05',
      credentialUrl: 'https://aws.amazon.com/certification/',
    },
  ],
  portfolio: [
    {
      id: 'proj-1',
      title: 'E-commerce Micro-frontend',
      description: 'Led migration from monolith to independent micro-apps.',
      url: 'https://example.com/projects/ecommerce',
      techStack: 'Next.js, Module Federation, AWS',
    },
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/example',
    github: 'https://github.com/example',
    website: 'https://example.dev',
  },
};

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  profileCompleteness: 72,
  recentInterviews: 3,
  creditsRemaining: 5,
  hasCv: true,
};
