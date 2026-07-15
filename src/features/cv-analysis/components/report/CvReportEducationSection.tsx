import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

interface CvReportEducationSectionProps {
  result: CvAnalysisResult;
}

export const CvReportEducationSection: React.FC<CvReportEducationSectionProps> = ({ result }) => {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('result.education')}>
      <h3 className="font-semibold text-foreground">{result.education.degree}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{result.education.school}</p>
      <p className="text-caption mt-1 text-muted-foreground">{result.education.period}</p>
    </CvFlowSectionCard>
  );
};
