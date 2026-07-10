import React from 'react';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { PricingTable } from '../components/PricingTable';

export const PricingPage: React.FC = () => {
  const { t } = useLanguage();
  usePageTitle(t('pricing.pageTitle'));

  return (
    <section className="page-section">
      <div className="page-container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h1 className="heading-primary mb-4 text-4xl">{t('pricing.title')}</h1>
          <p className="body-text text-lg">{t('pricing.description')}</p>
        </div>
        <PricingTable />
      </div>
    </section>
  );
};
