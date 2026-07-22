import { formatJobCategoryDisplay } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { JDMatchCard } from './JDMatchCard';
import { StrengthCard } from './StrengthCard';
import { SuggestionCard } from './SuggestionCard';
import { WeaknessCard } from './WeaknessCard';

interface CvAnalysisReportDetailProps {
  analysis: CvAnalysisResult;
}

export function CvAnalysisReportDetail({ analysis }: CvAnalysisReportDetailProps) {
  const { language, t } = useLanguage();
  const category =
    formatJobCategoryDisplay(analysis.jobCategory, language) || analysis.jobCategory;
  const analyzedAt = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';
  const hasJd = Boolean(analysis.jdId) || analysis.jdMatch != null;

  return (
    <div className="space-y-5 border-t border-zinc-800 px-5 py-5 motion-safe:animate-in motion-safe:fade-in motion-reduce:animate-none">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
        <h3 className="text-sm font-medium text-zinc-100">{t('cv.report.summary')}</h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 whitespace-normal [overflow-wrap:anywhere]">
          {analysis.summary || t('cv.report.emptyList')}
        </p>
        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500">{t('cv.report.jobCategory')}</dt>
            <dd className="font-medium text-zinc-100">{category}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">{t('cv.report.analyzedAt')}</dt>
            <dd className="font-medium text-zinc-100">{analyzedAt}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-zinc-500">{t('cv.report.jdUsage')}</dt>
            <dd className="font-medium text-zinc-100">
              {hasJd ? t('cv.report.withJd') : t('cv.report.withoutJd')}
            </dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <StrengthCard strengths={analysis.strengths} />
        <WeaknessCard weaknesses={analysis.weaknesses} />
      </div>

      <SuggestionCard suggestions={analysis.suggestions} />

      {analysis.jdMatch ? (
        <JDMatchCard jdMatch={analysis.jdMatch} />
      ) : (
        <p className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-sm text-zinc-400">
          {t('cv.report.noJdMatchNote')}
        </p>
      )}
    </div>
  );
}
