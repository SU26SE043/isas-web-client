import React from 'react';
import { useLanguage } from '@/shared/languages';
import { usePageMeta } from '@/shared/hooks/usePageMeta';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { EmployerSection } from '../components/EmployerSection';

export const HomePage: React.FC = () => {
  const { t } = useLanguage();
  usePageMeta({
    title: t('home.pageTitle'),
    description: t('home.metaDescription'),
  });

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <EmployerSection />
    </>
  );
};
