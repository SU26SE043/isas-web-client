import React from 'react';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { EmployerSection } from '../components/EmployerSection';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  usePageTitle(t('home.pageTitle'));

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <EmployerSection />
    </>
  );
};
