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
    <article className="rounded-3xl border border-subtle bg-surface-raised p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-raised/5 px-3 py-1 text-xs font-semibold text-foreground">
            <Target className="h-3.5 w-3.5" />
            {language === 'vi' ? item.skillNameVi : item.skillName}
          </div>
          <h3 className="heading-secondary text-xl text-foreground">
            {language === 'vi' ? item.skillNameVi : item.skillName}
          </h3>
          <p className="body-text max-w-3xl text-sm text-muted-foreground">
            {language === 'vi' ? item.feedbackVi : item.feedback}
          </p>
        </div>

        <div className="grid min-w-[220px] gap-3 rounded-xl bg-surface-raised/5 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{t('practice.gap.current')}</span>
            <span className="font-semibold text-foreground">{item.currentLevel}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{t('practice.gap.target')}</span>
            <span className="font-semibold text-[#A97D00]">{item.targetLevel}%</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{t('practice.gap.gap')}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-white">
              <ArrowUpRight className="h-4 w-4 text-foreground" />
              {gap}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>{t('practice.gap.current')}</span>
          <span>{t('practice.gap.target')}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/5">
          <div className="flex h-full">
            <div
              className="h-full rounded-full bg-surface-raised transition-all duration-300"
              style={{ width: progressWidth }}
            />
            <div
              className="h-full rounded-full bg-surface-overlay transition-all duration-300"
              style={{ width: `${Math.max(100 - item.currentLevel, 0)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section aria-label={t('practice.gap.feedback')} className="rounded-xl bg-surface-base p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle2 className="h-4 w-4 text-foreground" />
            {t('practice.gap.feedback')}
          </h4>
          <p className="body-text text-sm text-muted-foreground">
            {language === 'vi' ? item.feedbackVi : item.feedback}
          </p>
        </section>

        <section aria-label={t('practice.gap.actionPlan')} className="rounded-xl bg-surface-overlay p-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-foreground" />
            {t('practice.gap.actionPlan')}
          </h4>
          <ul className="space-y-3">
            {(language === 'vi' ? item.actionableStepsVi : item.actionableSteps).map((step) => (
              <li key={step} className="flex gap-3 text-sm text-muted-foreground">
                <span className="mt-1 h-2 w-2 flex-none rounded-full bg-surface-raised" />
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
    <section aria-labelledby="gap-analysis-title" className="rounded-3xl border border-subtle bg-surface-raised p-6 shadow-sm">
      <div className="mb-6">
        <h2 id="gap-analysis-title" className="heading-secondary text-2xl text-foreground">
          {t('practice.result.gapAnalysis')}
        </h2>
        <p className="mt-1 body-text text-sm text-muted-foreground">{t('practice.result.gapAnalysisDesc')}</p>
      </div>

      <div className="space-y-5">
        {items.map((item) => (
          <SkillGapCard key={item.id} item={item} language={language} />
        ))}
      </div>
    </section>
  );
});