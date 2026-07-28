import { useMemo } from 'react';
import { useLanguage } from '@/shared/languages';
import type { PracticeBenchmark } from '../../types/b2cPracticeSession.types';
import type { RadarData } from '../../types/result.types';
import type { CriteriaResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { SkillRadarChart } from '../SkillRadarChart';

function resolveBenchmarkTargets(
  criteria: CriteriaResultViewModel[],
  benchmark: PracticeBenchmark | null | undefined,
): Map<string, number> | null {
  if (!benchmark?.criteria?.length) return null;
  const byName = new Map<string, number>();
  const byId = new Map<string, number>();
  for (const item of benchmark.criteria) {
    if (!Number.isFinite(item.targetPercentage)) continue;
    byName.set(item.name.trim().toLowerCase(), item.targetPercentage);
    byId.set(item.criterionId.trim().toLowerCase(), item.targetPercentage);
  }
  const resolved = new Map<string, number>();
  for (const criterion of criteria) {
    const key = criterion.name.trim().toLowerCase();
    const target = byName.get(key) ?? byId.get(key);
    if (target != null) resolved.set(criterion.name, target);
  }
  return resolved.size > 0 ? resolved : null;
}

export function CriteriaRadarChart({
  criteria,
  passThresholdPct,
  benchmark,
}: {
  criteria: CriteriaResultViewModel[];
  passThresholdPct?: number;
  benchmark?: PracticeBenchmark | null;
}) {
  const { language, t } = useLanguage();
  const benchmarkTargets = useMemo(
    () => resolveBenchmarkTargets(criteria, benchmark),
    [benchmark, criteria],
  );
  const useBenchmark = Boolean(benchmarkTargets && benchmark?.label);

  const data = useMemo<RadarData[]>(() => {
    const fallbackThreshold = passThresholdPct ?? 0;
    return criteria.map((item) => ({
      subject: item.name,
      subjectVi: item.name,
      A: Math.round(item.pct),
      B: Math.round(
        useBenchmark
          ? (benchmarkTargets?.get(item.name) ?? fallbackThreshold)
          : fallbackThreshold,
      ),
      fullMark: 100,
      rawScore: item.score,
      maxScore: item.maxScore,
    }));
  }, [benchmarkTargets, criteria, passThresholdPct, useBenchmark]);

  if (criteria.length < 3) {
    return (
      <p className="text-sm text-muted-foreground">{t('practice.result.radarUnavailable')}</p>
    );
  }

  const showComparison = useBenchmark || passThresholdPct != null;
  const comparisonLabel = useBenchmark
    ? benchmark!.label
    : passThresholdPct != null
      ? t('practice.result.radarThresholdWithPct').replace(
          '{{n}}',
          String(Math.round(passThresholdPct)),
        )
      : t('practice.result.radarThreshold');

  return (
    <div className="space-y-3">
      <SkillRadarChart
        data={data}
        language={language}
        showThreshold={showComparison}
        yourScoreLabel={t('practice.result.radarYourScore')}
        thresholdLabel={comparisonLabel}
        embedded
      />
      {useBenchmark && benchmark?.source ? (
        <p className="text-xs text-muted-foreground">
          {benchmark.source === 'PeerAverage'
            ? t('practice.result.benchmarkPeerHint')
            : benchmark.source === 'PassThreshold'
              ? t('practice.result.benchmarkPassHint')
              : null}
          {benchmark.sampleSize > 0
            ? ` ${t('practice.result.benchmarkSampleSize').replace(
                '{{n}}',
                String(benchmark.sampleSize),
              )}`
            : null}
        </p>
      ) : null}
    </div>
  );
}
