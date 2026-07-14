import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { InterviewHistoryItem } from '../../types/history.types';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import type { RoadmapTargetLevel } from '../../mocks/practiceSetup.fixtures';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapConfirmStepProps {
  domain?: PracticeDomain;
  targetLevel: RoadmapTargetLevel | '';
  selectedReports: InterviewHistoryItem[];
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const RoadmapConfirmStep: React.FC<RoadmapConfirmStepProps> = ({
  domain,
  targetLevel,
  selectedReports,
  isSubmitting,
  onBack,
  onConfirm,
}) => {
  const { language, t } = useLanguage();
  const domainLabel = domain
    ? language === 'vi'
      ? domain.nameVi
      : domain.name
    : '—';

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.roadmapWizard.confirm.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.roadmapWizard.confirm.description')}</p>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.domain')}</dt>
          <dd className="font-medium text-foreground">{domainLabel}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.level')}</dt>
          <dd className="font-medium text-foreground">
            {targetLevel ? t(`practice.roadmapWizard.level.${targetLevel}`) : '—'}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.count')}</dt>
          <dd className="font-medium text-foreground">{selectedReports.length}</dd>
        </div>
      </dl>

      <ul className="mt-4 space-y-2">
        {selectedReports.map((report) => (
          <li
            key={report.id}
            className="rounded-lg border border-subtle bg-surface-overlay px-4 py-3 text-sm text-foreground"
          >
            {report.jobTitle}
            <span className="mt-1 block text-caption text-muted-foreground">
              {t(`practice.roadmapWizard.level.${report.level}`)} · {report.overallScore}
            </span>
          </li>
        ))}
      </ul>

      <RoadmapWizardNav
        onBack={onBack}
        onNext={onConfirm}
        nextLabel={t('practice.roadmapWizard.confirm.create')}
        isLoading={isSubmitting}
        nextDisabled={!domain || !targetLevel || selectedReports.length === 0}
      />
    </section>
  );
};
