import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

interface SuggestionCardProps {
  suggestions: string[];
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestions }) => {
  const { t } = useLanguage();

  return (
    <section className="rounded-2xl border border-info/25 bg-info/[0.045] p-6 backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-info/15 text-info-light ring-1 ring-info/20">
          <Lightbulb className="size-5" aria-hidden />
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">{t('cv.report.suggestions')}</h2>
      </div>

      {suggestions.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{t('cv.report.emptyList')}</p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {suggestions.map((item, index) => (
            <li
              key={`${index}-${item.slice(0, 24)}`}
              className="rounded-xl border border-info/15 bg-surface-raised/80 px-4 py-4 text-sm leading-relaxed text-foreground"
            >
              <span
                className="mb-2 flex size-6 items-center justify-center rounded-full bg-info/15 text-xs font-bold text-info-light"
                aria-label={t('cv.report.suggestionItem').replace('{n}', String(index + 1))}
              >
                {index + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
