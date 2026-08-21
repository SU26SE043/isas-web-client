import React from 'react';
import { useLanguage } from '@/shared/languages';
import { ROADMAP_FOCUS_MAX_CHARS, ROADMAP_NAME_MAX_CHARS } from '../../types/learning.types';
import type { InterviewHistoryItem } from '../../types/history.types';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import type { CvAnalysisResult, UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { LearningRoadmapCard } from '../../types/learningPath.types';
import type { RoadmapTargetLevel } from '../../mocks/practiceSetup.fixtures';
import { RoadmapWizardNav } from './RoadmapWizardNav';

interface RoadmapConfirmStepProps {
  domain?: PracticeDomain;
  targetLevel: RoadmapTargetLevel | '';
  name: string;
  onNameChange: (value: string) => void;
  selectedReports: InterviewHistoryItem[];
  cvId?: string;
  cvFiles: UploadedCvFile[];
  onCvChange: (value: string | undefined) => void;
  cvAnalyses: CvAnalysisResult[];
  cvAnalysisId?: string;
  onCvAnalysisChange: (value: string | undefined) => void;
  completedRoadmaps: LearningRoadmapCard[];
  priorRoadmapId?: string;
  onPriorRoadmapChange: (value: string | undefined) => void;
  focus: string;
  onFocusChange: (value: string) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const RoadmapConfirmStep: React.FC<RoadmapConfirmStepProps> = ({
  domain,
  targetLevel,
  name,
  onNameChange,
  selectedReports,
  cvId,
  cvFiles,
  onCvChange,
  cvAnalyses,
  cvAnalysisId,
  onCvAnalysisChange,
  completedRoadmaps,
  priorRoadmapId,
  onPriorRoadmapChange,
  focus,
  onFocusChange,
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
  const focusTooLong = focus.trim().length > ROADMAP_FOCUS_MAX_CHARS;
  const nameTooLong = name.trim().length > ROADMAP_NAME_MAX_CHARS;

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-6">
      <h2 className="heading-secondary text-lg">{t('practice.roadmapWizard.confirm.title')}</h2>
      <p className="body-text mt-1 text-sm">{t('practice.roadmapWizard.confirm.description')}</p>

      {/*
        Ô tên đặt Ở ĐẦU, trước bảng tóm tắt: đây là thứ DUY NHẤT ở bước này người dùng còn NHẬP,
        phần còn lại chỉ để đọc lại. Để nó lẫn dưới cuối danh sách thì người dùng lướt qua bảng
        tóm tắt rồi bấm luôn nút tạo mà không thấy mình đặt tên được.
      */}
      <label className="mt-5 block space-y-2">
        <span className="text-sm font-medium text-foreground">
          {t('practice.roadmapWizard.confirm.nameLabel')}
        </span>
        <input
          id="roadmap-confirm-name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          maxLength={ROADMAP_NAME_MAX_CHARS + 1}
          className="h-10 w-full rounded-xl border border-satin bg-surface-overlay px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t('practice.roadmapWizard.confirm.namePlaceholder')}
          disabled={isSubmitting}
        />
        <span className="flex justify-between text-caption text-muted-foreground">
          <span>
            {nameTooLong
              ? t('practice.roadmapWizard.confirm.nameTooLong')
              : t('practice.roadmapWizard.confirm.nameHint')}
          </span>
          <span>{name.trim().length}/{ROADMAP_NAME_MAX_CHARS}</span>
        </span>
      </label>

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
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.cv')}</dt>
          {cvFiles.length > 0 ? (
            <dd>
              <label className="sr-only" htmlFor="roadmap-confirm-cv">
                {t('practice.roadmapWizard.confirm.cv')}
              </label>
              <select
                id="roadmap-confirm-cv"
                value={cvId ?? ''}
                onChange={(event) => onCvChange(event.target.value || undefined)}
                disabled={isSubmitting}
                className="min-w-0 max-w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-right font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {cvFiles.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.fileName}
                  </option>
                ))}
              </select>
            </dd>
          ) : (
            <dd className="max-w-[70%] text-right font-medium text-muted-foreground">
              {t('practice.roadmapWizard.confirm.cvNone')}
            </dd>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.cvAnalysis')}</dt>
          {cvAnalyses.length > 0 ? (
            <dd>
              <label className="sr-only" htmlFor="roadmap-confirm-analysis">
                {t('practice.roadmapWizard.confirm.cvAnalysis')}
              </label>
              <select
                id="roadmap-confirm-analysis"
                value={cvAnalysisId ?? ''}
                onChange={(event) => onCvAnalysisChange(event.target.value || undefined)}
                disabled={isSubmitting}
                className="min-w-0 max-w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-right font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t('practice.roadmapWizard.confirm.notSelected')}</option>
                {cvAnalyses.map((analysis) => (
                  <option key={analysis.id} value={analysis.id}>
                    {analysis.jobCategory} · {new Date(analysis.createdAt).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </dd>
          ) : (
            <dd className="max-w-[70%] text-right font-medium text-muted-foreground">
              {t('practice.roadmapWizard.confirm.cvAnalysisNone')}
            </dd>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.priorRoadmap')}</dt>
          {completedRoadmaps.length > 0 ? (
            <dd>
              <label className="sr-only" htmlFor="roadmap-confirm-prior">
                {t('practice.roadmapWizard.confirm.priorRoadmap')}
              </label>
              <select
                id="roadmap-confirm-prior"
                value={priorRoadmapId ?? ''}
                onChange={(event) => onPriorRoadmapChange(event.target.value || undefined)}
                disabled={isSubmitting}
                className="min-w-0 max-w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-right font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">{t('practice.roadmapWizard.confirm.notSelected')}</option>
                {completedRoadmaps.map((roadmap) => (
                  <option key={roadmap.id} value={roadmap.id}>
                    {language === 'vi' ? roadmap.nameVi : roadmap.name}
                  </option>
                ))}
              </select>
            </dd>
          ) : (
            <dd className="max-w-[70%] text-right font-medium text-muted-foreground">
              {t('practice.roadmapWizard.confirm.priorRoadmapNone')}
            </dd>
          )}
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.count')}</dt>
          <dd className="font-medium text-foreground">{selectedReports.length}</dd>
        </div>
      </dl>

      {selectedReports.length > 0 ? (
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
      ) : null}

      <label className="mt-5 block space-y-2">
        <span className="text-sm font-medium text-foreground">
          {t('practice.roadmapWizard.confirm.focusLabel')}
        </span>
        <textarea
          value={focus}
          onChange={(event) => onFocusChange(event.target.value)}
          rows={4}
          maxLength={ROADMAP_FOCUS_MAX_CHARS + 50}
          className="w-full rounded-xl border border-satin bg-surface-overlay px-3 py-2 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={t('practice.roadmapWizard.confirm.focusPlaceholder')}
          disabled={isSubmitting}
        />
        <span className="flex justify-between text-caption text-muted-foreground">
          <span>
            {focusTooLong
              ? t('practice.roadmapWizard.confirm.focusTooLong')
              : t('practice.roadmapWizard.confirm.focusHint')}
          </span>
          <span>
            {focus.trim().length}/{ROADMAP_FOCUS_MAX_CHARS}
          </span>
        </span>
      </label>

      <p className="mt-4 text-caption text-muted-foreground">
        {t('practice.roadmapWizard.confirm.sessionsHint')}
      </p>

      <RoadmapWizardNav
        onBack={onBack}
        onNext={onConfirm}
        nextLabel={t('practice.roadmapWizard.confirm.create')}
        isLoading={isSubmitting}
        nextDisabled={!domain || !targetLevel || isSubmitting || focusTooLong || nameTooLong}
      />
    </section>
  );
};
