import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LearningLayout } from '@/layouts/LearningLayout';
import { CVAnalysisPage } from '@/features/cv-analysis/pages/CVAnalysisPage';
import { CVResultPage } from '@/features/cv-analysis/pages/CVResultPage';
import { PracticeHistoryResultPage } from '@/features/practice/pages/PracticeHistoryResultPage';
import { InterviewHistoryPage } from '@/features/practice/pages/InterviewHistoryPage';
import { RoadmapPage } from '@/features/practice/pages/RoadmapPage';
import { LearningHubPage } from '@/features/practice/pages/LearningHubPage';
import { LearningRoadmapDetailPage } from '@/features/practice/pages/LearningRoadmapDetailPage';
import { LearningTheoryPage } from '@/features/practice/pages/LearningTheoryPage';
import { LearningPracticeDeviceCheckPage } from '@/features/practice/pages/LearningPracticeDeviceCheckPage';
import { LearningLessonPracticePage } from '@/features/practice/pages/LearningLessonPracticePage';
import { LearningPracticeReportPage } from '@/features/practice/pages/LearningPracticeReportPage';
import { LearningQuestionReportPage } from '@/features/practice/pages/LearningQuestionReportPage';
import { LearningRoadmapReportPage } from '@/features/practice/pages/LearningRoadmapReportPage';
import { CandidateReportsPage } from '@/features/practice/pages/CandidateReportsPage';
import { LearningReaderLayout } from '@/features/practice/components/learning-path/LearningReaderLayout';
import { CertificateViewerPage } from '@/features/practice/pages/CertificateViewerPage';
import { CompareResultsPage } from '@/features/practice/pages/CompareResultsPage';
import { ProgressDashboardPage } from '@/features/practice/pages/ProgressDashboardPage';
import { LeaderboardPage } from '@/features/practice/pages/LeaderboardPage';
import { AchievementsPage } from '@/features/practice/pages/AchievementsPage';
import { CreditsWalletPage } from '@/features/payment/pages/CreditsWalletPage';
import { TokenUsagePage } from '@/features/payment/pages/TokenUsagePage';
import { SubscriptionPlansPage } from '@/features/payment/pages/SubscriptionPlansPage';
import { CheckoutPage } from '@/features/payment/pages/CheckoutPage';
import { PaymentCallbackPage } from '@/features/payment/pages/PaymentCallbackPage';
import { PaymentSuccessPage } from '@/features/payment/pages/PaymentSuccessPage';
import { PaymentFailedPage } from '@/features/payment/pages/PaymentFailedPage';
import { PaymentOrderDetailPage } from '@/features/payment/pages/PaymentOrderDetailPage';
import { HelpPage } from '@/features/engagement/pages/HelpPage';
import { NotificationsPage } from '@/features/engagement/pages/NotificationsPage';
import { SettingsPage } from '@/features/engagement/pages/SettingsPage';
import { SupportPage } from '@/features/engagement/pages/SupportPage';
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
import { CandidateRubricsPage } from '@/features/rubrics/pages/CandidateRubricsPage';
import { CandidateCampaignsPage } from '@/features/campaigns/pages/CandidateCampaignsPage';
import { CandidateCampaignBriefingPage } from '@/features/campaigns/pages/CandidateCampaignBriefingPage';
import { CandidateCampaignDetailPage } from '@/features/campaigns/pages/CandidateCampaignDetailPage';
import { CampaignFaceEnrollPage } from '@/features/campaigns/pages/CampaignFaceEnrollPage';
import { CampaignInterviewPage } from '@/features/campaigns/pages/CampaignInterviewPage';
import { CampaignInterviewCompletedPage } from '@/features/campaigns/pages/CampaignInterviewCompletedPage';
import { RequireAuth } from '@/routes/RequireAuth';
import { RequireRole } from '@/routes/RequireRole';
import { UserRole } from '@/features/auth/types/auth.types';
import { LegacyRedirect, PracticeHistoryLegacyRedirect, CandidateResultsLegacyRedirect, CandidateHistoryLegacyRedirect } from '@/routes/LegacyRedirect';
import { CvUploadLegacyRedirect } from '@/routes/CvUploadLegacyRedirect';

export const candidateRoutes: RouteObject[] = [
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole roles={[UserRole.CANDIDATE]} />,
        children: [
          {
            path: '/candidate/learning',
            element: <DashboardLayout />,
            children: [
              {
                element: <LearningLayout />,
                children: [
                  {
                    index: true,
                    element: <LearningHubPage />,
                  },
                  {
                    path: 'roadmaps/:roadmapId',
                    element: <LearningRoadmapDetailPage />,
                  },
                  {
                    path: 'roadmaps/:roadmapId/report',
                    element: <LearningRoadmapReportPage />,
                  },
                  {
                    path: 'roadmaps/:roadmapId/lessons/:lessonId',
                    element: <LearningReaderLayout />,
                    children: [
                      { path: 'theory', element: <LearningTheoryPage /> },
                      {
                        path: 'practice/device-check',
                        element: <LearningPracticeDeviceCheckPage />,
                      },
                      { path: 'practice', element: <LearningLessonPracticePage /> },
                      {
                        path: 'practice/questions/:questionId/report',
                        element: <LearningQuestionReportPage />,
                      },
                      { path: 'report', element: <LearningPracticeReportPage /> },
                    ],
                  },
                  { path: ':moduleId/practice', element: <Navigate to="/candidate/learning" replace /> },
                  { path: ':moduleId', element: <Navigate to="/candidate/learning" replace /> },
                ],
              },
            ],
          },
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
              { path: 'campaigns', element: <CandidateCampaignsPage /> },
              { path: 'campaigns/:token/briefing', element: <CandidateCampaignBriefingPage /> },
              { path: 'campaigns/:id', element: <CandidateCampaignDetailPage /> },
              {
                path: 'campaigns/:campaignId/face-enroll/:sessionId',
                element: <CampaignFaceEnrollPage />,
              },
              {
                path: 'campaigns/:campaignId/interview/:sessionId',
                element: <CampaignInterviewPage />,
              },
              {
                path: 'campaigns/:campaignId/completed/:sessionId',
                element: <CampaignInterviewCompletedPage />,
              },
              { path: 'campaigns/:id/enroll', element: <Navigate to="/candidate/campaigns" replace /> },
              { path: 'practice/history', element: <InterviewHistoryPage /> },
              { path: 'interview-history', element: <Navigate to="/candidate/practice/history" replace /> },
              { path: 'practice/history/compare', element: <CompareResultsPage /> },
              { path: 'practice/history/:id', element: <PracticeHistoryResultPage /> },
              { path: 'reports', element: <CandidateReportsPage /> },
              { path: 'rubrics', element: <CandidateRubricsPage /> },
              { path: 'results/:id', element: <CandidateResultsLegacyRedirect /> },
              { path: 'history', element: <CandidateHistoryLegacyRedirect /> },
              { path: 'roadmap', element: <RoadmapPage /> },
              { path: 'progress', element: <ProgressDashboardPage /> },
              { path: 'leaderboard', element: <LeaderboardPage /> },
              { path: 'achievements', element: <AchievementsPage /> },
              { path: 'credits', element: <CreditsWalletPage /> },
              { path: 'orders/:orderId', element: <PaymentOrderDetailPage /> },
              { path: 'usage', element: <TokenUsagePage /> },
              { path: 'subscription', element: <SubscriptionPlansPage /> },
              { path: 'payment', element: <CheckoutPage /> },
              { path: 'certificates/:id', element: <CertificateViewerPage /> },
              { path: 'notifications', element: <NotificationsPage scope="candidate" /> },
              { path: 'settings', element: <SettingsPage scope="candidate" /> },
              { path: 'help', element: <HelpPage scope="candidate" /> },
              { path: 'support', element: <SupportPage scope="candidate" /> },
            ],
          },
          { path: '/payment/callback', element: <PaymentCallbackPage /> },
          { path: '/payment/success', element: <PaymentSuccessPage /> },
          { path: '/payment/failed', element: <PaymentFailedPage /> },
          { path: '/profile', element: <LegacyRedirect /> },
          { path: '/cv-analysis', element: <LegacyRedirect /> },
          { path: '/cv-analysis/result', element: <LegacyRedirect /> },
          { path: '/practice/history', element: <Navigate to="/candidate/practice/history" replace /> },
          { path: '/practice/history/:id', element: <PracticeHistoryLegacyRedirect /> },
        ],
      },
    ],
  },
];
