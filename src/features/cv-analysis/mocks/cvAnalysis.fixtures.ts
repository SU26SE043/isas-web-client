import type { CvAnalysisResult } from '../types/cvAnalysis.types';

export const MOCK_CV_ANALYSIS_RESULT: CvAnalysisResult = {
  id: 'cv-analysis-001',
  fullName: 'Nguyen Van A',
  jobTitle: 'Senior Frontend Developer',
  profileCompletionPercent: 75,
  matchScore: 78,
  skills: [
    { name: 'React.js', highlight: true },
    { name: 'TypeScript', highlight: true },
    { name: 'Tailwind CSS', highlight: true },
    { name: 'Node.js' },
    { name: 'GraphQL' },
    { name: 'System Design' },
    { name: 'Agile' },
    { name: 'Unit Testing' },
  ],
  projects: [
    {
      title: 'E-commerce Micro-frontend',
      description: 'Led the migration of a monolithic frontend to a suite of independent micro-apps.',
      techStack: 'Next.js / Module Federation / AWS',
    },
    {
      title: 'Internal Dashboard System',
      description: 'Developed high-performance data visualization tools for real-time analytics.',
      techStack: 'D3.js / React / Redux Toolkit',
    },
  ],
  experiences: [
    {
      period: '2021 - PRESENT',
      title: 'Senior Frontend Engineer',
      company: 'TechFlow Solutions',
      description: 'Driving UI architecture and mentoring junior developers on modern React patterns.',
      highlight: true,
    },
    {
      period: '2018 - 2021',
      title: 'Frontend Developer',
      company: 'Global Soft Corp',
      description: 'Built responsive web applications for international banking clients.',
    },
  ],
  education: {
    degree: 'B.S. in Computer Science',
    school: 'University of Engineering and Technology',
    period: '2014 - 2018',
  },
};

export const MOCK_UPLOADED_CV_FILES = [
  {
    id: 'cv-file-001',
    fileName: 'nguyen-van-a-cv.pdf',
    fileSizeBytes: 248_320,
    mimeType: 'application/pdf',
    uploadedAt: '2026-07-10T09:30:00.000Z',
    analysisId: 'cv-analysis-001',
  },
];
