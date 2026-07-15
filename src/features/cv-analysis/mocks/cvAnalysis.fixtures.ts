import type { CvAnalysisResult } from '../types/cvAnalysis.types';

export const MOCK_CV_ANALYSIS_RESULT: CvAnalysisResult = {
  id: 'cv-analysis-001',
  fullName: 'Nguyen Van A',
  jobTitle: 'Senior Frontend Developer',
  profileCompletionPercent: 75,
  matchScore: 78,
  domain: 'frontend',
  skillDimensions: [
    { id: 'technical', labelEn: 'Technical stack', labelVi: 'Nhóm kỹ thuật', score: 88, target: 90 },
    { id: 'complexity', labelEn: 'Project complexity', labelVi: 'Độ phức tạp dự án', score: 82, target: 85 },
    { id: 'communication', labelEn: 'Communication', labelVi: 'Giao tiếp', score: 70, target: 80 },
    { id: 'leadership', labelEn: 'Leadership', labelVi: 'Lãnh đạo', score: 65, target: 75 },
    { id: 'domain', labelEn: 'Domain knowledge', labelVi: 'Kiến thức chuyên môn', score: 80, target: 85 },
  ],
  dimensionScores: [
    { id: 'technical', labelEn: 'Technical stack', labelVi: 'Nhóm kỹ thuật', score: 88 },
    { id: 'complexity', labelEn: 'Project complexity', labelVi: 'Độ phức tạp dự án', score: 82 },
    { id: 'communication', labelEn: 'Communication', labelVi: 'Giao tiếp', score: 70 },
    { id: 'leadership', labelEn: 'Leadership', labelVi: 'Lãnh đạo', score: 65 },
    { id: 'domain', labelEn: 'Domain knowledge', labelVi: 'Kiến thức chuyên môn', score: 80 },
  ],
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
    fileName: 'NguyenVanA_CV.pdf',
    fileSizeBytes: 248_320,
    mimeType: 'application/pdf',
    uploadedAt: '2026-07-11T16:30:00.000Z',
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    analysisId: 'cv-analysis-001',
  },
];
