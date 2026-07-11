import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CVAnalysisPage } from '@/features/cv-analysis/pages/CVAnalysisPage';
import { CVResultPage } from '@/features/cv-analysis/pages/CVResultPage';
import { InterviewResultPage } from '@/features/practice/pages/InterviewResultPage';
import { InterviewHistoryPage } from '@/features/practice/pages/InterviewHistoryPage';
import { RoadmapPage } from '@/features/practice/pages/RoadmapPage';
import { LearningHubPage } from '@/features/practice/pages/LearningHubPage';
import { LearningModulePage } from '@/features/practice/pages/LearningModulePage';
import { CertificateViewerPage } from '@/features/practice/pages/CertificateViewerPage';
import { CandidateDashboardPage } from '@/features/profile/pages/CandidateDashboardPage';
import { ProfileViewPage } from '@/features/profile/pages/ProfileViewPage';
import { ProfileCompletePage } from '@/features/profile/pages/ProfileCompletePage';
import { CareerGoalPage } from '@/features/profile/pages/CareerGoalPage';
import { EducationPage } from '@/features/profile/pages/EducationPage';
import { ExperiencePage } from '@/features/profile/pages/ExperiencePage';
import { SkillsPage } from '@/features/profile/pages/SkillsPage';
import { CertificatesPage } from '@/features/profile/pages/CertificatesPage';
import { PortfolioPage } from '@/features/profile/pages/PortfolioPage';
import { SocialLinksPage } from '@/features/profile/pages/SocialLinksPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { LegacyRedirect, PracticeHistoryLegacyRedirect } from '@/routes/LegacyRedirect';
import { CvUploadLegacyRedirect } from '@/routes/CvUploadLegacyRedirect';

export const candidateRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/candidate',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <CandidateDashboardPage /> },
          { path: 'profile', element: <ProfileViewPage /> },
          { path: 'profile/complete', element: <ProfileCompletePage /> },
          { path: 'profile/career-goal', element: <CareerGoalPage /> },
          { path: 'profile/education', element: <EducationPage /> },
          { path: 'profile/experience', element: <ExperiencePage /> },
          { path: 'profile/skills', element: <SkillsPage /> },
          { path: 'profile/certificates', element: <CertificatesPage /> },
          { path: 'profile/portfolio', element: <PortfolioPage /> },
          { path: 'profile/social', element: <SocialLinksPage /> },
          { path: 'cv/analysis', element: <CVAnalysisPage /> },
          { path: 'cv/analysis/report', element: <CVResultPage /> },
          { path: 'cv/upload', element: <CvUploadLegacyRedirect /> },
          { path: 'practice/history', element: <InterviewHistoryPage /> },
          { path: 'practice/history/:id', element: <InterviewResultPage /> },
          { path: 'roadmap', element: <RoadmapPage /> },
          { path: 'learning', element: <LearningHubPage /> },
          { path: 'learning/:moduleId', element: <LearningModulePage /> },
          { path: 'certificates/:id', element: <CertificateViewerPage /> },
        ],
      },
      { path: '/profile', element: <LegacyRedirect /> },
      { path: '/cv-analysis', element: <LegacyRedirect /> },
      { path: '/cv-analysis/result', element: <LegacyRedirect /> },
      { path: '/practice/history', element: <Navigate to="/candidate/practice/history" replace /> },
      { path: '/practice/history/:id', element: <PracticeHistoryLegacyRedirect /> },
    ],
  },
];
