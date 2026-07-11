import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { EmployerSection } from '@/features/home/components/EmployerSection';
import { useMarketingAuthModal } from '@/layouts/MarketingAuthModalProvider';

export const EnterprisePage: React.FC = () => {
  const { t } = useLanguage();
  const { openAuthModal } = useMarketingAuthModal();
  usePageTitle(t('enterprise.pageTitle'));

  return (
    <>
      <section className="page-section border-b border-subtle">
        <div className="page-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="heading-primary mb-4 text-4xl">{t('enterprise.title')}</h1>
            <p className="body-text mb-8 text-lg">{t('enterprise.description')}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button type="button" onClick={() => openAuthModal('signup')} className="btn-primary">
                {t('enterprise.cta')}
              </button>
              <Link to="/pricing" className="btn-secondary">
                {t('enterprise.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <EmployerSection />
    </>
  );
};
