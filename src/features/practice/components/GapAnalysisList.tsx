import { memo } from 'react';
import { ArrowUpRight, CheckCircle2, Target } from 'lucide-react';
import { useLanguage } from '../../../shared/languages';
import type { GapAnalysisItem } from '../types/result.types';

type Language = 'vi' | 'en';

interface GapAnalysisListProps {
  items: GapAnalysisItem[];
  language: Language;
}

const formatGap = (current: number, target: number) => Math.max(target - current, 0);

const getProgressWidth = (value: number) => `${Math.min(Math.max(value, 0), 100)}%`;

const SkillGapCard = memo(function SkillGapCard({
  item,
  language,
}: {
  item: GapAnalysisItem;
  language: Language;
}) {
  const { t } = useLanguage();
  const gap = formatGap(item.currentLevel, item.targetLevel);
  const progressWidth = getProgressWidth(item.currentLevel);

  return (
    <article className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-pine/5 px-3 py-1 text-xs font-semibold text-pine">
            <Target className="h-3.5 w-3.5" />
            {language === 'vi' ? item.skillNameVi : item.skillName}
          </div>
          <h3 className="heading-secondary text-xl text-pine">
            {language === 'vi' ? item.skillNameVi : item.skillName}
          </h3>
          <p className="body-text max-w-3xl text-sm text-black/70">
            {language === 'vi' ? item.feedbackVi : item.feedback}
          </p>
        </div>

        <div className="grid min-w-[220px] gap-3 rounded-2xl bg-pine/5 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/60">{t('practice.gap.current')}</span>
            <span className="font-semibold text-pine">{item.currentLevel}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/60">{t('practice.gap.target')}</span>
            <span className="font-semibold text-[#A97D00]">{item.targetLevel}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-black/60">{t('practice.gap.gap')}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-black">
              <ArrowUpRight className="h-4 w-4 text-milk" />
              {gap}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-black/50">
          <span>{t('practice.gap.current')}</span>
          <span>{t('practice.gap.target')}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/5">
          <div className="flex h-full">
            <div
              className="h-full rounded-full bg-pine transition-all duration-300"
              style={{ width: progressWidth }}
            />
            <div
              className="h-full rounded-full bg-milk transition-all duration-300"
              style={{ width: `${Math.max(100 - item.currentLevel, 0)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section aria-label={t('practice.gap.feedback')} className="rounded-2xl bg-[#F8FBF9] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-pine">
            <CheckCircle2 className="h-4 w-4 text-pine" />
            {t('practice.gap.feedback')}
          </h4>
          <p className="body-text text-sm text-black/70">
            {language === 'vi' ? item.feedbackVi : item.feedback}
          </p>
        </section>

        <section aria-label={t('practice.gap.actionPlan')} className="rounded-2xl bg-[#FFF9E2] p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-pine">
            <Target className="h-4 w-4 text-pine" />
            {t('practice.gap.actionPlan')}
          </h4>
          <ul className="space-y-3">
            {(language === 'vi' ? item.actionableStepsVi : item.actionableSteps).map((step) => (
              <li key={step} className="flex gap-3 text-sm text-black/75">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-pine" />
                <span className="body-text">{step}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </article>
  );
});

export const GapAnalysisList = memo(function GapAnalysisList({
  items,
  language,
}: GapAnalysisListProps) {
  const { t } = useLanguage();

  return (
    <section aria-labelledby="gap-analysis-title" className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 id="gap-analysis-title" className="heading-secondary text-2xl text-pine">
          {t('practice.result.gapAnalysis')}
        </h2>
        <p className="mt-1 body-text text-sm text-black/70">{t('practice.result.gapAnalysisDesc')}</p>
      </div>

      <div className="space-y-5">
        {items.map((item) => (
          <SkillGapCard key={item.id} item={item} language={language} />
        ))}
      </div>
    </section>
  );
});