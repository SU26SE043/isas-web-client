import type { RouteObject } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { FullscreenLayout } from '@/layouts/FullscreenLayout';
import { UserRole } from '@/features/auth/types/auth.types';
import { RequireRole } from '@/routes/RequireRole';
import { PracticeEntryPage } from '@/features/practice/pages/PracticeEntryPage';
import { PracticeInterviewPage } from '@/features/practice/pages/PracticeInterviewPage';
import { InterviewResultPage } from '@/features/practice/pages/InterviewResultPage';
import { InterviewPrepPage } from '@/features/practice/pages/InterviewPrepPage';
import { DeviceCheckPage } from '@/features/practice/pages/DeviceCheckPage';
import { TermsAcceptancePage } from '@/features/practice/pages/TermsAcceptancePage';
import { IdentityVerifyPage } from '@/features/practice/pages/IdentityVerifyPage';
import { WaitingRoomPage } from '@/features/practice/pages/WaitingRoomPage';
import { InterviewCompletePage } from '@/features/practice/pages/InterviewCompletePage';
import { PracticeSessionResultPage } from '@/features/practice/pages/PracticeSessionResultPage';

export const interviewRoutes: RouteObject[] = [
  {
    element: <RequireRole roles={[UserRole.CANDIDATE, UserRole.ADMIN]} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [{ path: '/practice', element: <PracticeEntryPage /> }],
      },
      { path: '/practice/result', element: <PracticeSessionResultPage /> },
      { path: '/practice/interview/:id', element: <InterviewResultPage /> },
      {
        element: <FullscreenLayout />,
        children: [
          { path: '/interview/:sessionId/prepare', element: <InterviewPrepPage /> },
          { path: '/interview/:sessionId/device-check', element: <DeviceCheckPage /> },
          { path: '/interview/:sessionId/terms', element: <TermsAcceptancePage /> },
          { path: '/interview/:sessionId/identity', element: <IdentityVerifyPage /> },
          { path: '/interview/:sessionId/waiting', element: <WaitingRoomPage /> },
          { path: '/interview/:sessionId/room', element: <PracticeInterviewPage /> },
          { path: '/interview/:sessionId/complete', element: <InterviewCompletePage /> },
        ],
      },
    ],
  },
];
