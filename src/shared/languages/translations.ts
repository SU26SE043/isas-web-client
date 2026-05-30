import { authTranslations } from '../../features/auth/languages/translations';
import { cvAnalysisTranslations } from '../../features/cv-analysis/languages/translations';
import { homeTranslations } from '../../features/home/languages/translations';
import { layoutTranslations } from '../../layouts/languages/translations';
import { mergeTranslations } from './mergeTranslations';

export const translations = mergeTranslations(
  layoutTranslations,
  homeTranslations,
  authTranslations,
  cvAnalysisTranslations
);
