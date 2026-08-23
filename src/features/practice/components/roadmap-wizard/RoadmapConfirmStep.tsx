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
import { formatPracticeSessionStamp, practiceReportTitle } from '../../utils/practiceReportLabel';

interface RoadmapConfirmStepProps {
  scope: RoadmapScope;
  onScopeChange: (scope: RoadmapScope) => void;
  domain?: PracticeDomain;
  targetLevel: RoadmapTargetLevel | '';
  currentLevel: RoadmapTargetLevel;
  name: string;
  selectedReports: InterviewHistoryItem[];
  cvId?: string;
  cvFiles: UploadedCvFile[];
  onCvChange: (value: string | undefined) => void;
  cvAnalyses: CvAnalysisResult[];
  cvAnalysisId?: string;
  completedRoadmaps: LearningRoadmapCard[];
  priorRoadmapId?: string;
  /** Dẫn ngược về bước sở hữu giá trị. Vắng ⇒ bước đó không có trong `steps` ⇒ không vẽ nút Sửa. */
  onEditCvAnalysis?: () => void;
  onEditPriorRoadmap?: () => void;
  focus: string;
  isSubmitting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}

export const RoadmapConfirmStep: React.FC<RoadmapConfirmStepProps> = ({
  domain,
  targetLevel,
  currentLevel,
  name,
  selectedReports,
  scope,
  onScopeChange,
  cvAnalyses,
  cvAnalysisId,
  completedRoadmaps,
  priorRoadmapId,
  onEditCvAnalysis,
  onEditPriorRoadmap,
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
        {/*
          F6 — lộ trình sinh ra từ KHOẢNG CÁCH giữa trình độ hiện tại và cấp độ mục tiêu. Trước đây
          bản tóm tắt chỉ hiện vế mục tiêu ⇒ giấu mất một nửa dữ kiện quyết định nội dung, và người
          dùng không rà lại được giá trị mình vừa đặt ở bước trước.
        */}
        <div className="flex justify-between gap-4 border-b border-subtle py-2">
          <dt className="text-muted-foreground">{t('practice.roadmapWizard.confirm.currentLevel')}</dt>
          <dd className="font-medium text-foreground">
            {t(`practice.roadmapWizard.level.${currentLevel}`)}
          </dd>
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

          ⚠ Đây là ô NHẬP duy nhất còn lại ở bước Xác nhận, và có chủ đích: quy mô KHÔNG
          có bước riêng nào khác, nên nó chỉ có MỘT nguồn nhập — không rơi vào lỗi mà F5
          sửa (hai ô nhập cho cùng một giá trị, người dùng không biết cái nào thắng).
          Nếu sau này tách quy mô thành bước riêng thì hàng này phải chuyển sang chỉ đọc.
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
        <RoadmapConfirmSources
          cvAnalyses={cvAnalyses}
          cvAnalysisId={cvAnalysisId}
          completedRoadmaps={completedRoadmaps}
          priorRoadmapId={priorRoadmapId}
          onEditCvAnalysis={onEditCvAnalysis}
          onEditPriorRoadmap={onEditPriorRoadmap}
        />
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
              {/* Cùng nhãn với bảng chọn ở bước "Báo cáo" — hai chỗ liệt kê CÙNG một buổi mà gọi
                  tên khác nhau thì người dùng không rà soát lại được mình đã tick đúng chưa. */}
              {(() => {
                const title = practiceReportTitle(report);
                return title.isFreePractice
                  ? `${t('practice.roadmapWizard.reports.freePractice')}${title.text ? ` · ${title.text}` : ''}`
                  : title.text;
              })()}
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
