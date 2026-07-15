import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

interface CvReportInsightsSectionProps {
  result: CvAnalysisResult;
}

export const CvReportInsightsSection: React.FC<CvReportInsightsSectionProps> = ({ result: _result }) => {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('result.aiInsights')}>
      <p className="text-sm leading-relaxed text-muted-foreground">{t('result.aiInsightBody')}</p>
      <div className="mt-4 rounded-lg border border-subtle bg-surface-overlay px-4 py-3">
        <p className="text-label text-muted-foreground">{t('result.topRecommendation')}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{t('result.topRecommendationBody')}</p>
      </div>
    </CvFlowSectionCard>
  );
};
