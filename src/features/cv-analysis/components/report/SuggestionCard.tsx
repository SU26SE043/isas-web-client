import React from 'react';
import { Lightbulb } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

interface SuggestionCardProps {
  suggestions: string[];
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestions }) => {
  const { t } = useLanguage();

  return (
    <section className="frame-satin rounded-3xl bg-[var(--glass-bg)] p-6 backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/[0.08] text-foreground">
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
              className="rounded-2xl border border-satin bg-white/[0.03] px-4 py-4 text-sm leading-relaxed text-foreground"
            >
              <span className="mb-2 block text-caption text-muted-foreground">
                {t('cv.report.suggestionItem').replace('{n}', String(index + 1))}
              </span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
