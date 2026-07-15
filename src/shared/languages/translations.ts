import { profileTranslations } from '../../features/profile/languages/translations';
import { authTranslations } from '../../features/auth/languages/translations';
import { cvAnalysisTranslations } from '../../features/cv-analysis/languages/translations';
import { campaignsTranslations } from '../../features/campaigns/languages/translations';
import { homeTranslations } from '../../features/home/languages/translations';
import { marketingTranslations } from '../../features/marketing/languages/translations';
import { layoutTranslations } from '../../layouts/languages/translations';
import { practiceTranslations } from '../../features/practice/languages/translations';
import { paymentTranslations } from '../../features/payment/languages/translations';
import { employerCampaignTranslations } from '../../features/employer-campaigns/languages/translations';
import { employerTranslations } from '../../features/employer/languages/translations';
import { employerAnalyticsTranslations } from '../../features/employer-analytics/languages/translations';
import { adminTranslations } from '../../features/admin/languages/translations';
import { employerBillingTranslations } from '../../features/employer-billing/languages/translations';
import { engagementTranslations } from '../../features/engagement/languages/translations';
import { designSystemTranslations } from './designSystemTranslations';
import { mergeTranslations } from './mergeTranslations';

export const translations = mergeTranslations(
  layoutTranslations,
  homeTranslations,
  marketingTranslations,
  authTranslations,
  profileTranslations,
  cvAnalysisTranslations,
  campaignsTranslations,
  practiceTranslations,
  paymentTranslations,
  employerCampaignTranslations,
  employerTranslations,
  employerAnalyticsTranslations,
  adminTranslations,
  employerBillingTranslations,
  engagementTranslations,
  designSystemTranslations,
);
