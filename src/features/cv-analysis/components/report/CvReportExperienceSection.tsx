import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

interface CvReportExperienceSectionProps {
  result: CvAnalysisResult;
}

export const CvReportExperienceSection: React.FC<CvReportExperienceSectionProps> = ({ result }) => {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('result.experience')}>
      <ul className="space-y-5">
        {result.experiences.map((item) => (
          <li key={`${item.company}-${item.period}`} className="border-l-2 border-subtle pl-4">
            <p className="text-caption text-muted-foreground">{item.period}</p>
            <h3 className="mt-1 font-semibold text-foreground">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.company}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </li>
        ))}
      </ul>
    </CvFlowSectionCard>
  );
};
