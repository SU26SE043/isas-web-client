import React from 'react';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { InterviewHistoryItem } from '../../types/history.types';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapReportsStepProps {
  reports: InterviewHistoryItem[];
  selectedIds: string[];
  isLoading: boolean;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const RoadmapReportsStep: React.FC<RoadmapReportsStepProps> = ({
  reports,
  selectedIds,
  isLoading,
  onToggle,
  onSelectAll,
  onUnselectAll,
  onBack,
  onNext,
}) => {
  const { language, t } = useLanguage();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (isLoading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-subtle bg-surface-raised">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.roadmapWizard.reports.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.roadmapWizard.reports.description')}</p>
      <p className="mt-2 text-caption text-muted-foreground">
        {t('practice.roadmapWizard.reports.futureNote')}
      </p>

      {reports.length === 0 ? (
        <p className="mt-6 rounded-lg border border-subtle bg-surface-overlay px-4 py-6 text-sm text-muted-foreground" role="status">
          {t('practice.roadmapWizard.reports.emptyOptional')}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-ghost text-sm" onClick={onSelectAll}>
              {t('practice.roadmapWizard.reports.selectAll')}
            </button>
            <button type="button" className="btn-ghost text-sm" onClick={onUnselectAll}>
              {t('practice.roadmapWizard.reports.unselectAll')}
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {reports.map((report) => {
              const checked = selectedIds.includes(report.id);
              return (
                <li key={report.id}>
                  <label
                    className={[
                      'flex cursor-pointer gap-3 rounded-lg border px-4 py-3 transition',
                      checked
                        ? 'border-default bg-surface-elevated'
                        : 'border-subtle bg-surface-overlay hover:border-default',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-foreground"
                      checked={checked}
                      onChange={() => onToggle(report.id)}
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-medium text-foreground">{report.jobTitle}</p>
                      <p className="text-caption text-muted-foreground">
                        {formatDate(report.date)} · {t('practice.roadmapWizard.reports.score')}:{' '}
                        {report.overallScore} · {t(`practice.roadmapWizard.level.${report.level}`)} ·{' '}
                        {report.duration} {t('practice.roadmapWizard.reports.minutes')} ·{' '}
                        {t(
                          report.status === 'in-progress'
                            ? 'practice.history.status.inProgress'
                            : report.status === 'pending'
                              ? 'practice.history.status.pending'
                              : 'practice.history.status.completed',
                        )}
                      </p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <RoadmapWizardNav onBack={onBack} onNext={onNext} />
    </section>
  );
};
