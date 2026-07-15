import React from 'react';
import { useLanguage } from '@/shared/languages';

interface SummaryCardProps {
  summary: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const { t } = useLanguage();

  return (
    <section className="frame-satin rounded-3xl bg-[var(--glass-bg)] p-6 backdrop-blur-xl sm:p-8">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{t('cv.report.summary')}</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground sm:text-base">
        {summary || t('cv.report.emptySummary')}
      </p>
    </section>
  );
};
