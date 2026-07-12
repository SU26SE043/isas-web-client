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
import { LearningPracticePage } from '@/features/practice/pages/LearningPracticePage';
import { CertificateViewerPage } from '@/features/practice/pages/CertificateViewerPage';
import { CompareResultsPage } from '@/features/practice/pages/CompareResultsPage';
import { ProgressDashboardPage } from '@/features/practice/pages/ProgressDashboardPage';
import { LeaderboardPage } from '@/features/practice/pages/LeaderboardPage';
import { AchievementsPage } from '@/features/practice/pages/AchievementsPage';
import { CampaignBrowsePage } from '@/features/campaigns/pages/CampaignBrowsePage';
import { CampaignDetailPage } from '@/features/campaigns/pages/CampaignDetailPage';
import { CampaignEnrollmentPage } from '@/features/campaigns/pages/CampaignEnrollmentPage';
import { CreditsWalletPage } from '@/features/payment/pages/CreditsWalletPage';
import { SubscriptionPlansPage } from '@/features/payment/pages/SubscriptionPlansPage';
import { CheckoutPage } from '@/features/payment/pages/CheckoutPage';
import { PaymentCallbackPage } from '@/features/payment/pages/PaymentCallbackPage';
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
          { path: 'campaigns', element: <CampaignBrowsePage /> },
          { path: 'campaigns/:id', element: <CampaignDetailPage /> },
          { path: 'campaigns/:id/enroll', element: <CampaignEnrollmentPage /> },
          { path: 'practice/history', element: <InterviewHistoryPage /> },
          { path: 'practice/history/compare', element: <CompareResultsPage /> },
          { path: 'practice/history/:id', element: <InterviewResultPage /> },
          { path: 'roadmap', element: <RoadmapPage /> },
          { path: 'learning', element: <LearningHubPage /> },
          { path: 'learning/:moduleId/practice', element: <LearningPracticePage /> },
          { path: 'learning/:moduleId', element: <LearningModulePage /> },
          { path: 'progress', element: <ProgressDashboardPage /> },
          { path: 'leaderboard', element: <LeaderboardPage /> },
          { path: 'achievements', element: <AchievementsPage /> },
          { path: 'credits', element: <CreditsWalletPage /> },
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
      { path: '/profile', element: <LegacyRedirect /> },
      { path: '/cv-analysis', element: <LegacyRedirect /> },
      { path: '/cv-analysis/result', element: <LegacyRedirect /> },
      { path: '/practice/history', element: <Navigate to="/candidate/practice/history" replace /> },
      { path: '/practice/history/:id', element: <PracticeHistoryLegacyRedirect /> },
    ],
  },
];
