import React from 'react';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { LegalPageContent } from '../components/LegalPageContent';

const privacySections = [
  { titleKey: 'legal.privacy.section1.title', bodyKey: 'legal.privacy.section1.body' },
  { titleKey: 'legal.privacy.section2.title', bodyKey: 'legal.privacy.section2.body' },
  { titleKey: 'legal.privacy.section3.title', bodyKey: 'legal.privacy.section3.body' },
] as const;

export const PrivacyPage: React.FC = () => {
  const { t } = useLanguage();
  usePageTitle(t('legal.privacy.pageTitle'));

  return (
    <LegalPageContent
      pageTitleKey="legal.privacy.pageTitle"
      titleKey="legal.privacy.title"
      introKey="legal.privacy.intro"
      sections={[...privacySections]}
    />
  );
};
