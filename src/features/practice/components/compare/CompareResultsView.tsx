import { useLanguage } from '@/shared/languages';
import type { CompareResultsResponse } from '../../types/result.types';
import { ScoreDial } from '../result/ScoreDial';

interface CompareResultsViewProps {
  data: CompareResultsResponse;
}

const formatDate = (value: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

export function CompareResultsView({ data }: CompareResultsViewProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const skills = data.left.radarData.map((item, index) => ({
    key: item.subject,
    label: language === 'vi' ? item.subjectVi : item.subject,
    left: item.A,
    right: data.right.radarData[index]?.A ?? 0,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {[data.left, data.right].map((result, index) => (
          <article key={result.id} className="rounded-xl border border-subtle bg-surface-raised p-6">
            <p className="text-label text-muted-foreground">
              {index === 0 ? t('practice.compare.left') : t('practice.compare.right')}
            </p>
            <h2 className="heading-secondary mt-2 text-xl text-foreground">
              {formatDate(result.completedAt, locale)}
            </h2>
            <div className="mt-4 flex justify-center">
              <ScoreDial score={result.overallScore} label={t('practice.result.overallScore')} />
            </div>
            <p className="body-text mt-4 text-sm text-muted-foreground">
              {language === 'vi' ? result.summaryVi : result.summary}
            </p>
          </article>
        ))}
      </div>

      <section className="rounded-xl border border-subtle bg-surface-raised p-6">
        <h3 className="heading-secondary text-lg text-foreground">{t('practice.compare.skillDelta')}</h3>
        <div className="mt-4 space-y-3">
          {skills.map((skill) => {
            const delta = skill.right - skill.left;
            const deltaLabel =
              delta > 0 ? `+${delta}` : delta < 0 ? `${delta}` : t('practice.compare.noChange');
            const deltaClass =
              delta > 0 ? 'text-success' : delta < 0 ? 'text-error' : 'text-muted-foreground';

            return (
              <div
                key={skill.key}
                className="grid grid-cols-[1.4fr_0.6fr_0.6fr_0.6fr] items-center gap-3 rounded-lg bg-surface-base px-4 py-3 text-sm"
              >
                <span className="font-medium text-foreground">{skill.label}</span>
                <span className="text-muted-foreground">{skill.left}%</span>
                <span className="text-muted-foreground">{skill.right}%</span>
                <span className={`font-semibold ${deltaClass}`}>{deltaLabel}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
