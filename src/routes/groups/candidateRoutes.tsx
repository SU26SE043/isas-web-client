import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CVAnalysisPage } from '@/features/cv-analysis/pages/CVAnalysisPage';
import { CVResultPage } from '@/features/cv-analysis/pages/CVResultPage';
import { PracticeInterviewPage } from '@/features/practice/pages/PracticeInterviewPage';
import { InterviewResultPage } from '@/features/practice/pages/InterviewResultPage';
import { InterviewHistoryPage } from '@/features/practice/pages/InterviewHistoryPage';
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
import { UserRole } from '@/features/auth/types/auth.types';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
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
        ],
      },
      { path: '/profile', element: <LegacyRedirect /> },
      { path: '/cv-analysis', element: <LegacyRedirect /> },
      { path: '/cv-analysis/result', element: <LegacyRedirect /> },
      { path: '/practice/history', element: <Navigate to="/candidate/practice/history" replace /> },
      { path: '/practice/history/:id', element: <PracticeHistoryLegacyRedirect /> },
    ],
  },
  {
    element: <RequireRole roles={[UserRole.CANDIDATE, UserRole.ADMIN]} />,
    children: [
      { path: '/practice', element: <PracticeInterviewPage /> },
      { path: '/practice/result', element: <InterviewResultPage /> },
      { path: '/practice/interview/:id', element: <InterviewResultPage /> },
    ],
  },
];
