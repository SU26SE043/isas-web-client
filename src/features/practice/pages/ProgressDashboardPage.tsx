import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { progressService } from '../services/progress.service';
import type {
  ProgressAnalyticsDashboard,
  ProgressDomainId,
  ProgressExportKind,
  ProgressTimeRange,
} from '../types/progress.types';
import { ProgressOverallSummary } from '../components/progress/ProgressOverallSummary';
import { ProgressInterviewReadiness } from '../components/progress/ProgressInterviewReadiness';
import { ProgressDomainGrid } from '../components/progress/ProgressDomainGrid';
import { ProgressScoreHistoryChart } from '../components/progress/ProgressScoreHistoryChart';
import {
  ProgressSkillBreakdown,
  ProgressStrengths,
  ProgressWeaknesses,
} from '../components/progress/ProgressSkillsPanels';
import {
  ProgressGoalTracking,
  ProgressImprovementTrend,
  ProgressLearningHeatmap,
  ProgressPracticeTimeline,
  ProgressRoadmapProgress,
} from '../components/progress/ProgressMoreSections';
import {
  ProgressAchievementsPreview,
  ProgressAiInsights,
  ProgressComparativeStats,
  ProgressExportPanel,
  ProgressRecommendations,
  ProgressSessionAnalytics,
} from '../components/progress/ProgressInsightsSections';

const RANGES: ProgressTimeRange[] = ['7d', '30d', '90d', '6m', '1y', 'all'];

export const ProgressDashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [domain, setDomain] = useState<ProgressDomainId>('all');
  const [range, setRange] = useState<ProgressTimeRange>('30d');
  const [data, setData] = useState<ProgressAnalyticsDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exporting, setExporting] = useState<ProgressExportKind | null>(null);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [goalMessage, setGoalMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await progressService.getDashboard({ domain, range });
      setData(response);
    } finally {
      setIsLoading(false);
    }
  }, [domain, range]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleExport = async (kind: ProgressExportKind) => {
    if (!data) return;
    setExporting(kind);
    setExportMessage(null);
    try {
      await progressService.exportReport(kind, data);
      setExportMessage(t('practice.progress.export.done'));
    } finally {
      setExporting(null);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.progress.loading')}</span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-6xl space-y-6 pb-12">
        <header className="space-y-4">
          <div>
            <h1 className="heading-primary text-3xl text-foreground">{t('practice.progress.title')}</h1>
            <p className="body-text mt-1 text-sm text-muted-foreground">{t('practice.progress.subtitle')}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t('practice.progress.filters.domain')}
              <select
                className="min-w-[160px] rounded-lg border border-default bg-surface-raised px-3 py-2 text-sm text-foreground"
                value={domain}
                onChange={(event) => setDomain(event.target.value as ProgressDomainId)}
              >
                {data.availableDomains.map((option) => (
                  <option key={option.id} value={option.id}>
                    {language === 'vi' ? option.nameVi : option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-muted-foreground">
              {t('practice.progress.filters.range')}
              <select
                className="min-w-[140px] rounded-lg border border-default bg-surface-raised px-3 py-2 text-sm text-foreground"
                value={range}
                onChange={(event) => setRange(event.target.value as ProgressTimeRange)}
              >
                {RANGES.map((item) => (
                  <option key={item} value={item}>
                    {t(`practice.progress.range.${item}`)}
                  </option>
                ))}
              </select>
            </label>
            {isLoading ? (
              <Loader2 className="mt-6 size-4 animate-spin text-muted-foreground" aria-hidden />
            ) : null}
          </div>
        </header>

        <ProgressOverallSummary data={data.overall} />
        <ProgressInterviewReadiness data={data.readiness} />
        <ProgressDomainGrid domains={data.domains} />
        <ProgressScoreHistoryChart points={data.scoreHistory} />
        <ProgressSkillBreakdown skills={data.skills} />
        <ProgressStrengths items={data.strengths} />
        <ProgressWeaknesses items={data.weaknesses} />
        <ProgressImprovementTrend items={data.improvementTrends} />
        <ProgressPracticeTimeline items={data.timeline} />
        <ProgressLearningHeatmap days={data.heatmap} />
        <div>
          <ProgressGoalTracking
            goals={data.goals}
            onCreateStub={() => setGoalMessage(t('practice.progress.goals.stub'))}
          />
          {goalMessage ? <p className="mt-2 text-sm text-muted-foreground">{goalMessage}</p> : null}
        </div>
        <ProgressRoadmapProgress items={data.roadmaps} />
        <ProgressAchievementsPreview items={data.achievements} />
        <ProgressAiInsights items={data.insights} />
        <ProgressRecommendations items={data.recommendations} />
        <ProgressComparativeStats items={data.comparative} />
        <ProgressSessionAnalytics data={data.sessionAnalytics} />
        <ProgressExportPanel exporting={exporting} onExport={(kind) => void handleExport(kind)} message={exportMessage} />
      </div>
    </div>
  );
};
