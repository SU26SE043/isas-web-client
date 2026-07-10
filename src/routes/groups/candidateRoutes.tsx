import type { RouteObject } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CVAnalysisPage } from '@/features/cv-analysis/pages/CVAnalysisPage';
import { CVResultPage } from '@/features/cv-analysis/pages/CVResultPage';
import { ProfilePage } from '@/features/auth/pages/ProfilePage';
import { PracticeInterviewPage } from '@/features/practice/pages/PracticeInterviewPage';
import { InterviewResultPage } from '@/features/practice/pages/InterviewResultPage';
import { InterviewHistoryPage } from '@/features/practice/pages/InterviewHistoryPage';
import { UserRole } from '@/features/auth/types/auth.types';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';

export const candidateRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { path: 'cv-analysis', element: <CVAnalysisPage /> },
          { path: 'cv-analysis/result', element: <CVResultPage /> },
        ],
      },
      {
        element: <DashboardLayout />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'practice/history', element: <InterviewHistoryPage /> },
          { path: 'practice/history/:id', element: <InterviewResultPage /> },
        ],
      },
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
