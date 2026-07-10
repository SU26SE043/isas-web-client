import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

interface CvReportSkillsSectionProps {
  result: CvAnalysisResult;
}

export const CvReportSkillsSection: React.FC<CvReportSkillsSectionProps> = ({ result }) => {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('result.skills')}>
      <ul className="flex flex-wrap gap-2">
        {result.skills.map((skill) => (
          <li key={skill.name}>
            <span
              className={
                skill.highlight
                  ? 'inline-flex rounded-full border border-default bg-surface-elevated px-3 py-1.5 text-sm font-medium text-foreground'
                  : 'inline-flex rounded-full border border-subtle bg-surface-overlay px-3 py-1.5 text-sm text-muted-foreground'
              }
            >
              {skill.name}
            </span>
          </li>
        ))}
      </ul>
    </CvFlowSectionCard>
  );
};
