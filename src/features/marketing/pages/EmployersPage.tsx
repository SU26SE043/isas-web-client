import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { EmployerSection } from '@/features/home/components/EmployerSection';

export const EmployersPage: React.FC = () => {
  const { t } = useLanguage();
  usePageTitle(t('employers.pageTitle'));

  return (
    <>
      <section className="page-section border-b border-subtle">
        <div className="page-container">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="heading-primary mb-4 text-4xl">{t('employers.title')}</h1>
            <p className="body-text mb-8 text-lg">{t('employers.description')}</p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary">
                {t('employers.cta')}
              </Link>
              <Link to="/pricing" className="btn-secondary">
                {t('employers.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <EmployerSection />
    </>
  );
};
