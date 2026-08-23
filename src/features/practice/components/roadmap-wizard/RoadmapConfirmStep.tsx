import React from 'react';
import { useLanguage } from '@/shared/languages';
import {
  ROADMAP_SCOPES,
  ROADMAP_SCOPE_LESSONS,
  type RoadmapScope,
} from '../../types/learning.types';
import type { InterviewHistoryItem } from '../../types/history.types';
import type { PracticeDomain } from '../../types/practiceSetup.types';
import type { CvAnalysisResult, UploadedCvFile } from '@/features/cv-analysis/types/cvAnalysis.types';
import type { LearningRoadmapCard } from '../../types/learningPath.types';
import type { RoadmapTargetLevel } from '../../mocks/practiceSetup.fixtures';
import { RoadmapWizardNav } from './RoadmapWizardNav';
import { RoadmapConfirmSources } from './RoadmapConfirmSources';
import { formatPracticeSessionStamp } from '../../utils/practiceReportLabel';

interface RoadmapConfirmStepProps {
  scope: RoadmapScope;
  onScopeChange: (scope: RoadmapScope) => void;
  domain?: PracticeDomain;
  targetLevel: RoadmapTargetLevel | '';
  name: string;
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
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const RoadmapConfirmStep: React.FC<RoadmapConfirmStepProps> = ({
  domain,
  targetLevel,
  name,
  selectedReports,
  scope,
  onScopeChange,
  cvAnalyses,
  cvAnalysisId,
  onCvAnalysisChange,
  completedRoadmaps,
  priorRoadmapId,
  onPriorRoadmapChange,
  focus,
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
        {/*
          Tên và Mục tiêu nay được NHẬP ở bước 2, đây chỉ hiển thị lại để rà soát — cùng vai với
          Lĩnh vực / Cấp độ bên dưới. Đặt ô nhập ở cả hai bước sẽ có hai nguồn cho một giá trị, và
          người dùng không biết cái nào thắng.
        */}
        <div className="flex justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.nameLabel')}</dt>
          <dd className="max-w-[70%] text-right font-medium text-foreground">
            {name.trim() || t('practice.roadmapWizard.confirm.nameAuto')}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.focusLabel')}</dt>
          <dd className="max-w-[70%] whitespace-pre-wrap text-right font-medium text-foreground">
            {focus.trim() || t('practice.roadmapWizard.confirm.focusNone')}
          </dd>
        </div>
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
        {/*
          Quy mô quyết định SỐ BÀI, mà mỗi bài tiêu 1 credit — nên nó phải nằm ở đúng
          chỗ người dùng đang quyết "có tạo không", kèm giá. Trước khi có hàng này, mọi
          lộ trình tạo qua giao diện đều là Standard (12 bài) trong khi suất dùng thử
          chỉ có 3: người mới chạm 402 ở bài thứ tư mà không hiểu vì sao.
        */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.scope')}</dt>
          <dd className="flex items-center gap-3">
            <label className="sr-only" htmlFor="roadmap-confirm-scope">
              {t('practice.roadmapWizard.confirm.scope')}
            </label>
            <select
              id="roadmap-confirm-scope"
              value={scope}
              onChange={(event) => onScopeChange(event.target.value as RoadmapScope)}
              disabled={isSubmitting}
              className="rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-right font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ROADMAP_SCOPES.map((s) => (
                <option key={s} value={s}>
                  {t(`practice.roadmapWizard.confirm.scope.${s.toLowerCase()}`)}
                </option>
              ))}
            </select>
            <span className="text-caption text-muted-foreground">
              {t('practice.roadmapWizard.confirm.scopeCost').replace(
                '{count}',
                String(ROADMAP_SCOPE_LESSONS[scope]),
              )}
            </span>
          </dd>
        </div>
        <RoadmapConfirmSources cvAnalyses={cvAnalyses} cvAnalysisId={cvAnalysisId} onCvAnalysisChange={onCvAnalysisChange} completedRoadmaps={completedRoadmaps} priorRoadmapId={priorRoadmapId} onPriorRoadmapChange={onPriorRoadmapChange} isSubmitting={isSubmitting} />
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
              {/* Danh sách này KHÔNG có cột ngày ⇒ kèm cả ngày lẫn giờ, nếu không mọi buổi cùng
                  ngành hiện y hệt nhau và người dùng không kiểm được mình đã chọn đúng buổi chưa. */}
              <span className="mt-1 block text-caption text-muted-foreground">
                {[
                  formatPracticeSessionStamp(report.date, language, { withDate: true }),
                  t(`practice.roadmapWizard.level.${report.level}`),
                  String(report.overallScore),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </li>
          ))}
        </ul>
      ) : null}


      <p className="mt-4 text-caption text-muted-foreground">
        {t('practice.roadmapWizard.confirm.sessionsHint')}
      </p>

      <RoadmapWizardNav
        onBack={onBack}
        onNext={onConfirm}
        nextLabel={t('practice.roadmapWizard.confirm.create')}
        isLoading={isSubmitting}
        nextDisabled={!domain || !targetLevel || isSubmitting}
      />
    </section>
  );
};
