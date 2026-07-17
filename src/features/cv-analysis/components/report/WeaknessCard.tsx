import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

interface WeaknessCardProps {
  weaknesses: string[];
}

export const WeaknessCard: React.FC<WeaknessCardProps> = ({ weaknesses }) => {
  const { t } = useLanguage();

  return (
    <section className="frame-satin flex h-full flex-col rounded-3xl border-warning/20 bg-warning-bg/40 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{t('cv.report.weaknesses')}</h2>
      </div>

      {weaknesses.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t('cv.report.emptyList')}</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {weaknesses.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
