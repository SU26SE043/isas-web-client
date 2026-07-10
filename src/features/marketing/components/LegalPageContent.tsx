import React from 'react';
import { useLanguage } from '@/shared/languages';

interface LegalSection {
  titleKey: string;
  bodyKey: string;
}

interface LegalPageContentProps {
  pageTitleKey: string;
  titleKey: string;
  introKey: string;
  sections: LegalSection[];
}

export const LegalPageContent: React.FC<LegalPageContentProps> = ({
  pageTitleKey,
  titleKey,
  introKey,
  sections,
}) => {
  const { t } = useLanguage();

  return (
    <section className="page-section">
      <div className="page-container">
        <article className="mx-auto max-w-3xl">
          <p className="text-caption mb-4">{t('legal.lastUpdated')}</p>
          <h1 className="heading-primary mb-6 text-4xl">{t(titleKey)}</h1>
          <p className="body-text mb-10 text-lg leading-relaxed">{t(introKey)}</p>
          <div className="space-y-8">
            {sections.map((section) => (
              <section key={section.titleKey}>
                <h2 className="heading-secondary mb-3 text-xl">{t(section.titleKey)}</h2>
                <p className="body-text leading-relaxed">{t(section.bodyKey)}</p>
              </section>
            ))}
          </div>
          <span className="sr-only">{t(pageTitleKey)}</span>
        </article>
      </div>
    </section>
  );
};
