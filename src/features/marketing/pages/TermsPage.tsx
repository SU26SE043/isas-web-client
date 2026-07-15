import React from 'react';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { LegalPageContent } from '../components/LegalPageContent';

const termsSections = [
  { titleKey: 'legal.terms.section1.title', bodyKey: 'legal.terms.section1.body' },
  { titleKey: 'legal.terms.section2.title', bodyKey: 'legal.terms.section2.body' },
  { titleKey: 'legal.terms.section3.title', bodyKey: 'legal.terms.section3.body' },
] as const;

export const TermsPage: React.FC = () => {
  const { t } = useLanguage();
  usePageTitle(t('legal.terms.pageTitle'));

  return (
    <LegalPageContent
      pageTitleKey="legal.terms.pageTitle"
      titleKey="legal.terms.title"
      introKey="legal.terms.intro"
      sections={[...termsSections]}
    />
  );
};
