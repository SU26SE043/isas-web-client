import { BadgeCheck, ClipboardList, PieChart, Star } from 'lucide-react';
import { StatCard, StatGrid } from '@/components/patterns/StatCard';
import { useLanguage } from '@/shared/languages';
import type { WeightStatus } from '../types/rubric.types';

interface RubricSummaryProps {
  criteriaCount: number;
  totalWeightLabel: string;
  totalMaxScore: number;
  weightStatus: WeightStatus;
}

export function RubricSummary({ criteriaCount, totalWeightLabel, totalMaxScore, weightStatus }: RubricSummaryProps) {
  const { t } = useLanguage();
  const weightValid = weightStatus === 'valid';
  const statusLabel = weightValid
    ? t('rubrics.summary.statusValid')
    : weightStatus === 'over'
      ? t('rubrics.summary.statusOver')
      : t('rubrics.summary.statusUnder');

  return (
    <StatGrid columns={4}>
      <StatCard label={t('rubrics.summary.criteriaCount')} value={String(criteriaCount)} icon={<ClipboardList aria-hidden />} />
      <StatCard
        label={t('rubrics.summary.totalWeight')}
        value={totalWeightLabel}
        icon={<PieChart aria-hidden />}
        tone={weightValid ? 'success' : 'error'}
      />
      {/* Thông tin thuần: tổng điểm tối đa không có ngưỡng đúng/sai (điểm tổng chấm theo % từng tiêu chí). */}
      <StatCard
        label={t('rubrics.summary.totalMaxScore')}
        value={String(totalMaxScore)}
        icon={<Star aria-hidden />}
        hint={t('rubrics.summary.totalMaxScoreHint')}
      />
      <StatCard
        label={t('rubrics.summary.status')}
        value={statusLabel}
        icon={<BadgeCheck aria-hidden />}
        tone={weightValid ? 'success' : 'error'}
        hint={weightValid ? t('rubrics.summary.statusValidHint') : undefined}
      />
    </StatGrid>
  );
}
