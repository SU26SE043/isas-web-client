import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { CvAnalysisResult } from '../../types/cvAnalysis.types';
import { CvFlowSectionCard } from '../flow/CvFlowSectionCard';

interface CvReportProjectsSectionProps {
  result: CvAnalysisResult;
}

export const CvReportProjectsSection: React.FC<CvReportProjectsSectionProps> = ({ result }) => {
  const { t } = useLanguage();

  return (
    <CvFlowSectionCard title={t('result.projects')}>
      <ul className="space-y-4">
        {result.projects.map((project) => (
          <li key={project.title} className="rounded-lg border border-subtle bg-surface-overlay px-4 py-3">
            <h3 className="font-semibold text-foreground">{project.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            <p className="text-caption mt-2 text-muted-foreground">{project.techStack}</p>
          </li>
        ))}
      </ul>
    </CvFlowSectionCard>
  );
};
