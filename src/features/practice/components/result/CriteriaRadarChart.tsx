import { useMemo } from 'react';
import { useLanguage } from '@/shared/languages';
import type { RadarData } from '../../types/result.types';
import type { CriteriaResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { SkillRadarChart } from '../SkillRadarChart';

export function CriteriaRadarChart({
  criteria,
  passThresholdPct,
}: {
  criteria: CriteriaResultViewModel[];
  passThresholdPct?: number;
}) {
  const { language, t } = useLanguage();

  const data = useMemo<RadarData[]>(() => {
    const threshold = passThresholdPct ?? 0;
    return criteria.map((item) => ({
      subject: item.name,
      subjectVi: item.name,
      A: Math.round(item.pct),
      B: Math.round(threshold),
      fullMark: 100,
      rawScore: item.score,
      maxScore: item.maxScore,
    }));
  }, [criteria, passThresholdPct]);

  if (criteria.length < 3) {
    return (
      <p className="text-sm text-muted-foreground">{t('practice.result.radarUnavailable')}</p>
    );
  }

  return (
    <SkillRadarChart
      data={data}
      language={language}
      showThreshold={passThresholdPct != null}
      yourScoreLabel={t('practice.result.radarYourScore')}
      thresholdLabel={
        passThresholdPct != null
          ? t('practice.result.radarThresholdWithPct').replace(
              '{{n}}',
              String(Math.round(passThresholdPct)),
            )
          : t('practice.result.radarThreshold')
      }
      embedded
    />
  );
}
