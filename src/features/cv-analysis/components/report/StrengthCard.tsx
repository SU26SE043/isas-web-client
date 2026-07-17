import React from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

interface StrengthCardProps {
  strengths: string[];
}

export const StrengthCard: React.FC<StrengthCardProps> = ({ strengths }) => {
  const { t } = useLanguage();

  return (
    <section className="frame-satin flex h-full flex-col rounded-3xl border-success/20 bg-success-bg/40 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-success/15 text-success">
          <Check className="size-5" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{t('cv.report.strengths')}</h2>
      </div>

      {strengths.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t('cv.report.emptyList')}</p>
      ) : (
        <ul className="mt-5 flex flex-wrap gap-2">
          {strengths.map((item) => (
            <li
              key={item}
              className="rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-sm text-success"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
