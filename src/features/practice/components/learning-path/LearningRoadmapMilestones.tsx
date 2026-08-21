import { Link } from 'react-router-dom';
import { BookOpen, BrainCircuit, Database, FileCode2, Lock, RotateCcw, Star } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapDetail } from '../../types/learningPath.types';

interface LearningRoadmapMilestonesProps {
  roadmap: LearningRoadmapDetail;
  language: string;
  launchingLessonId: string | null;
  /** Bài đang chờ server tạo buổi luyện lại — khoá nút để không bấm ra hai buổi. */
  retryingLessonId?: string | null;
  onOpenPractice: (lessonId: string, title: string, sessionId?: string | null) => void;
  /** Mở hộp thoại xác nhận. KHÔNG được gọi thẳng API ở đây (thao tác tiêu credit). */
  onRetryPractice?: (lessonId: string, title: string) => void;
}

export function LearningRoadmapMilestones({ roadmap, language, launchingLessonId, retryingLessonId = null, onOpenPractice, onRetryPractice }: LearningRoadmapMilestonesProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-8 space-y-4">
      {roadmap.milestones.map((milestone) => {
        const locked = milestone.status === 'locked';
        const milestoneTitle = language === 'vi' ? milestone.titleVi : milestone.title;
        return (
          <section key={milestone.id} className="rounded-2xl border border-info/55 bg-surface-raised/80 p-5 shadow-[0_18px_50px_-35px_rgba(59,130,246,0.8)] backdrop-blur-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-3 heading-secondary text-lg text-foreground">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-violet-400/50 bg-violet-500/10 text-violet-300"><Star className="size-5" aria-hidden /></span>
                {t('practice.learningPath.milestone').replace('{n}', String(milestone.order))} · {milestoneTitle}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                {locked ? <Lock className="size-3.5" aria-hidden /> : null} {t(`practice.learningPath.milestoneStatus.${milestone.status}`)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('practice.learningPath.lessonCount').replace('{count}', String(milestone.lessons.length))} · {milestone.progressPercent}%
            </p>
            {milestone.status === 'completed' && milestone.improvement?.length ? (
              <div className="mt-4 rounded-xl border border-info/30 bg-surface-overlay/60 p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {t('practice.learningPath.improvementTitle')}
                </h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2" aria-label={t('practice.learningPath.improvementTitle')}>
                  {milestone.improvement.map((item) => (
                    <li key={item.criterionName} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">{item.criterionName}</span>
                      <span className={item.deltaPct < 0 ? 'font-semibold text-error' : 'font-semibold text-success'}>
                        {item.deltaPct >= 0 ? '+' : '−'}{Math.abs(item.deltaPct)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <ul className="mt-4 space-y-2">
              {milestone.lessons.map((lessonItem, lessonIndex) => {
                const lessonTitle = language === 'vi' ? lessonItem.titleVi : lessonItem.title;
                const canOpenTheory = !locked && (lessonItem.theoryStatus === 'available' || lessonItem.theoryStatus === 'completed' || roadmap.readOnly);
                const canOpenPractice = !locked && !roadmap.readOnly && (lessonItem.practiceStatus === 'available' || lessonItem.apiStatus === 'Practicing');
                const reportLink = lessonItem.practiceReportId ? `/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/report` : null;
                // `canRetry` do SERVER quyết định — không suy từ apiStatus/practiceStatus.
                //
                // ⚠ CỐ Ý không gác thêm `!roadmap.readOnly`: `readOnly` bật khi lộ trình đã
                // Hoàn thành (`roadmapMapper.ts:249`), mà đó CHÍNH LÀ lúc người học muốn luyện
                // lại để nâng điểm. Backend được thiết kế đúng theo hướng đó — làm lại một bài
                // sẽ MỞ LẠI lộ trình đã hoàn thành và tính lại báo cáo. Gác ở đây làm nút biến
                // mất ở đúng trạng thái tính năng sinh ra để phục vụ, và triệu chứng duy nhất
                // là "không thấy nút" chứ không có lỗi nào nổ.
                const canRetry = lessonItem.canRetry === true && Boolean(onRetryPractice);
                const isRetrying = retryingLessonId === lessonItem.id;
                return (
                  <li key={lessonItem.id} className="rounded-xl border border-info/30 bg-surface-overlay/70 px-4 py-4 shadow-[inset_3px_0_0_rgba(124,58,237,0.9)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-3 font-medium text-foreground"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-info/40 bg-info/10 text-info"><LessonIcon index={lessonIndex} /></span>{lessonTitle}</p>
                        <p className="text-caption text-muted-foreground">{t('practice.learningPath.theory')}: {t(`practice.learningPath.part.${lessonItem.theoryStatus}`)} · {t('practice.learningPath.practice')}: {t(`practice.learningPath.part.${lessonItem.practiceStatus}`)}</p>
                        {lessonItem.attemptCount > 1 ? (
                          <p className="text-caption text-muted-foreground">
                            {t('practice.learningPath.attemptCount').replace('{count}', String(lessonItem.attemptCount))}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {canOpenTheory ? <Link to={`/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/theory`} className="inline-flex items-center gap-2 rounded-xl border border-info/70 bg-info/10 px-4 py-2.5 text-xs font-semibold text-foreground"><BookOpen className="size-4 text-info" aria-hidden />{t('practice.learningPath.openTheory')}</Link> : null}
                        {canOpenPractice ? <button type="button" className="btn-primary inline-flex text-xs" disabled={launchingLessonId === lessonItem.id} onClick={() => onOpenPractice(lessonItem.id, lessonTitle, lessonItem.sessionId)}>{launchingLessonId === lessonItem.id ? t('practice.learningPath.saving') : lessonItem.apiStatus === 'Practicing' ? t('practice.learningPath.continuePracticeSession') : t('practice.learningPath.openPractice')}</button> : null}
                        {lessonItem.apiStatus === 'Done' ? <Link to={`/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/theory`} className="btn-secondary inline-flex text-xs">{t('practice.learningPath.reviewLesson')}</Link> : null}
                        {canRetry ? (
                          <button
                            type="button"
                            className="btn-secondary inline-flex items-center gap-2 text-xs"
                            disabled={isRetrying}
                            onClick={() => onRetryPractice?.(lessonItem.id, lessonTitle)}
                          >
                            <RotateCcw className="size-4" aria-hidden />
                            {isRetrying ? t('practice.learningPath.retryStarting') : t('practice.learningPath.retryLesson')}
                            {/* Báo giá TRƯỚC khi bấm, không đợi server trả 402. */}
                            <span className="text-caption text-muted-foreground">
                              · {t('practice.learningPath.retryCostHint')}
                            </span>
                          </button>
                        ) : null}
                        {reportLink ? <Link to={reportLink} className="btn-ghost inline-flex text-xs">{t('practice.learningPath.viewReport')}</Link> : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function LessonIcon({ index }: { index: number }) {
  const Icon = [FileCode2, Database, BrainCircuit][index % 3] ?? BookOpen;
  return <Icon className="size-5" aria-hidden />;
}
