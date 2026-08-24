import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Code2, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { useTokenWallet } from '@/features/payment/hooks/useTokenWallet';
import { LearningCreditWarningDialog } from '../components/learning-path/LearningCreditWarningDialog';
import { LearningRoadmapCreditSummary } from '../components/learning-path/LearningRoadmapCreditSummary';
import { LearningRoadmapMilestones } from '../components/learning-path/LearningRoadmapMilestones';
import { RoadmapNameEditor } from '../components/learning-path/RoadmapNameEditor';
import { RoadmapSourceSection } from '../components/learning-path/RoadmapSourceSection';
import { invalidateLearningRoadmaps, updateRoadmapNameInCache, useLearningRoadmapDetail } from '../hooks/useLearningRoadmaps';
import { roadmapService } from '../services/roadmap.service';
import {
  learningInterviewPreparePath,
  startLearningLessonPractice,
} from '../utils/launchLearningInterviewPractice';
export function LearningRoadmapDetailPage() {
  const { roadmapId = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { language, t } = useLanguage();
  const [launchingLessonId, setLaunchingLessonId] = useState<string | null>(null);
  const [creditOpen, setCreditOpen] = useState(false);
  const [creditRejected, setCreditRejected] = useState(false);
  const [launchError, setLaunchError] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [pendingPractice, setPendingPractice] = useState<{ lessonId: string; title: string } | null>(null);
  const { available: creditsRemaining } = useTokenWallet();

  const { data: roadmap, isLoading, isError, error, refetch, isFetching } =
    useLearningRoadmapDetail(roadmapId);
  const errorStatus = isError ? roadmapService.getErrorStatus(error) : undefined;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" role="status">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.learningPath.loading')}</span>
      </div>
    );
  }

  if (isError || !roadmap) {
    const isNotFound = errorStatus === 404;
    const isForbidden = errorStatus === 403;
    return (
      <div className="page-container page-section min-h-screen">
        <Link to="/candidate/learning" className="text-sm text-muted-foreground hover:text-foreground">
          {t('practice.learningPath.backToDashboard')}
        </Link>
        <div className="mt-8">
          <EmptyState
            className="frame-satin"
            variant={isForbidden ? 'no-permission' : 'no-results'}
            title={
              isNotFound
                ? t('practice.learningPath.errorNotFoundTitle')
                : isForbidden
                  ? t('practice.learningPath.errorForbiddenTitle')
                  : t('practice.learningPath.errorTitle')
            }
            description={
              isNotFound
                ? t('practice.learningPath.errorNotFound')
                : isForbidden
                  ? t('practice.learningPath.errorForbidden')
                  : t('practice.learningPath.error')
            }
            action={
              isNotFound || isForbidden ? (
                <Link to="/candidate/learning" className="btn-secondary inline-flex">
                  {t('practice.learningPath.backToDashboard')}
                </Link>
              ) : (
                <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
                  <AlertCircle className="size-4" aria-hidden />
                  {t('practice.learningPath.retry')}
                </Button>
              )
            }
          />
        </div>
      </div>
    );
  }

  const title = language === 'vi' ? roadmap.nameVi : roadmap.name;
  const resolvedFrom = roadmap.resolvedFrom;
  const remainingLessons = roadmap.milestones.reduce(
    (sum, milestone) => sum + milestone.lessons.filter((lesson) => lesson.apiStatus !== 'Done').length,
    0,
  );
  const openPractice = async (lessonId: string, lessonTitle: string, sessionId?: string | null, bypassCreditWarning = false) => {
    if (!sessionId && !bypassCreditWarning && (creditsRemaining ?? 0) < 1) {
      setCreditRejected(false);
      setPendingPractice({ lessonId, title: lessonTitle });
      setCreditOpen(true);
      return;
    }
    setLaunchingLessonId(lessonId);
    setLaunchError(false);
    try {
      if (sessionId) {
        navigate(learningInterviewPreparePath(sessionId, { roadmapId, lessonId }));
        return;
      }
      const result = await startLearningLessonPractice({
        roadmapId: roadmap.id,
        lessonId,
        title: lessonTitle,
      });
      if (!result.ok) {
        setLaunchingLessonId(null);
        if (result.code === 'insufficient_credits') {
          setCreditRejected(true);
          setPendingPractice({ lessonId, title: lessonTitle });
          setCreditOpen(true);
        } else {
          setLaunchError(true);
        }
        return;
      }
      navigate(learningInterviewPreparePath(result.session.sessionId, { roadmapId, lessonId }));
    } catch {
      setLaunchingLessonId(null);
      setLaunchError(true);
    }
  };

  const saveRoadmapName = async (nextName: string) => {
    setIsSavingName(true);
    setRenameError(null);
    try {
      const savedName = await roadmapService.renameRoadmap(roadmap.id, nextName);
      updateRoadmapNameInCache(queryClient, roadmap.id, savedName);
      await invalidateLearningRoadmaps(queryClient);
    } catch {
      setRenameError(t('practice.learningPath.renameError'));
      throw new Error('ROADMAP_NAME_SAVE_FAILED');
    } finally {
      setIsSavingName(false);
    }
  };

  return (
    <div className="page-container page-section min-h-screen bg-[radial-gradient(circle_at_80%_0%,rgba(37,99,235,0.15),transparent_32%),radial-gradient(circle_at_20%_100%,rgba(124,58,237,0.12),transparent_28%)]">
      <Link to="/candidate/learning" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="size-4 text-info" aria-hidden />
        {t('practice.learningPath.backToDashboard')}
      </Link>

      <header className="relative mt-5 space-y-4 overflow-hidden rounded-2xl border border-info/45 bg-surface-raised/70 p-6 shadow-[0_20px_60px_-40px_rgba(59,130,246,0.85)] sm:p-8">
        <div className="absolute -right-12 -top-16 size-52 rounded-full border border-info/20" aria-hidden />
        <div className="relative flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl border border-info/45 bg-info/10 text-info"><Code2 className="size-6" aria-hidden /></span><p className="text-sm font-medium text-muted-foreground">{language === 'vi' ? roadmap.domainLabelVi : roadmap.domainLabel} · {t(`practice.roadmapWizard.level.${roadmap.targetLevel}`)} · {t(`practice.learningPath.status.${roadmap.status}`)}</p></div>
        <RoadmapNameEditor
          name={title}
          isSaving={isSavingName}
          error={renameError}
          onSave={saveRoadmapName}
        />
        <p className="text-sm text-muted-foreground">
          {(language === 'vi' ? roadmap.domainLabelVi : roadmap.domainLabel)} ·{' '}
          {t(`practice.roadmapWizard.level.${roadmap.targetLevel}`)} ·{' '}
          {t(`practice.learningPath.status.${roadmap.status}`)}
          {roadmap.readOnly ? ` · ${t('practice.learningPath.readOnly')}` : ''}
        </p>
        <div className="relative max-w-2xl">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{t('practice.learningPath.progress')}</span>
            <span>{roadmap.progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${roadmap.progressPercent}%` }} />
          </div>
        </div>
        <LearningRoadmapCreditSummary remainingLessons={remainingLessons} balance={creditsRemaining ?? 0} />
      </header>

      {resolvedFrom ? (
        <RoadmapSourceSection resolvedFrom={resolvedFrom} language={language} t={t} />
      ) : null}

      {/*
        KHÔNG khoá sau `status === 'completed'`: backend vốn đã dựng báo cáo TẠM THỜI cho
        lộ trình đang học (không gọi AI, nên thiếu phần nhận xét tổng quan — trang báo cáo
        tự nói rõ điều đó bằng banner). Khoá lại chỉ giấu mất dữ liệu đã có sẵn.
      */}
      <Link
        to={`/candidate/learning/roadmaps/${roadmap.id}/report`}
        className="btn-secondary mt-4 inline-flex text-sm"
      >
        {roadmap.status === 'completed'
          ? t('practice.learningPath.viewRoadmapReport')
          : t('practice.learningPath.viewRoadmapReportInterim')}
      </Link>

      <LearningRoadmapMilestones
        roadmap={roadmap}
        language={language}
        launchingLessonId={launchingLessonId}
        onOpenPractice={(lessonId, lessonTitle, sessionId) => void openPractice(lessonId, lessonTitle, sessionId)}
      />
      {launchError ? (
        <p className="mt-4 text-sm text-error" role="alert">
          {t('practice.learningPath.startError')}
        </p>
      ) : null}
      <LearningCreditWarningDialog
        open={creditOpen}
        onOpenChange={setCreditOpen}
        balance={creditsRemaining ?? 0}
        backendRejected={creditRejected}
        onContinue={() => {
          if (!pendingPractice) return;
          const pending = pendingPractice;
          setCreditOpen(false);
          setPendingPractice(null);
          setCreditRejected(false);
          void openPractice(pending.lessonId, pending.title, undefined, true);
        }}
      />
    </div>
  );
}
