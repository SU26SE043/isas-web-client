import { profileTranslations } from '../../features/profile/languages/translations';
import { authTranslations } from '../../features/auth/languages/translations';
import { cvAnalysisTranslations } from '../../features/cv-analysis/languages/translations';
import { campaignsTranslations } from '../../features/campaigns/languages/translations';
import { homeTranslations } from '../../features/home/languages/translations';
import { marketingTranslations } from '../../features/marketing/languages/translations';
import { layoutTranslations } from '../../layouts/languages/translations';
import { practiceTranslations } from '../../features/practice/languages/translations';
import { paymentTranslations } from '../../features/payment/languages/translations';
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
  designSystemTranslations,
);
