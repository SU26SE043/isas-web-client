import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, BookOpen, BrainCircuit, Code2, Database, FileCode2, Loader2, Lock, Star } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { useLearningRoadmapDetail } from '../hooks/useLearningRoadmaps';
import { roadmapService } from '../services/roadmap.service';
import {
  learningInterviewPreparePath,
  startLearningLessonPractice,
} from '../utils/launchLearningInterviewPractice';
export function LearningRoadmapDetailPage() {
  const { roadmapId = '' } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [launchingLessonId, setLaunchingLessonId] = useState<string | null>(null);

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
  const openPractice = async (lessonId: string, lessonTitle: string, sessionId?: string | null) => {
    setLaunchingLessonId(lessonId);
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
        return;
      }
      navigate(learningInterviewPreparePath(result.session.sessionId, { roadmapId, lessonId }));
    } catch {
      setLaunchingLessonId(null);
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
        <h1 className="relative heading-primary text-4xl text-foreground sm:text-5xl">{title}</h1>
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
      </header>

      {roadmap.status === 'completed' ? (
        <Link
          to={`/candidate/learning/roadmaps/${roadmap.id}/report`}
          className="btn-secondary mt-4 inline-flex text-sm"
        >
          {t('practice.learningPath.viewRoadmapReport')}
        </Link>
      ) : null}

      <div className="mt-8 space-y-4">
        {roadmap.milestones.map((milestone) => {
          const locked = milestone.status === 'locked';
          const milestoneTitle = language === 'vi' ? milestone.titleVi : milestone.title;
          return (
            <section
              key={milestone.id}
              className="rounded-2xl border border-info/55 bg-surface-raised/80 p-5 shadow-[0_18px_50px_-35px_rgba(59,130,246,0.8)] backdrop-blur-sm sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-3 heading-secondary text-lg text-foreground">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full border border-violet-400/50 bg-violet-500/10 text-violet-300"><Star className="size-5" aria-hidden /></span>
                  {t('practice.learningPath.milestone').replace('{n}', String(milestone.order))} ·{' '}
                  {milestoneTitle}
                </h2>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  {locked ? <Lock className="size-3.5" aria-hidden /> : null}
                  {t(`practice.learningPath.milestoneStatus.${milestone.status}`)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('practice.learningPath.lessonCount').replace('{count}', String(milestone.lessons.length))} ·{' '}
                {milestone.progressPercent}%
              </p>

              <ul className="mt-4 space-y-2">
                {milestone.lessons.map((lessonItem, lessonIndex) => {
                  const lessonTitle = language === 'vi' ? lessonItem.titleVi : lessonItem.title;
                  const canOpenTheory =
                    !locked &&
                    (lessonItem.theoryStatus === 'available' ||
                      lessonItem.theoryStatus === 'completed' ||
                      roadmap.readOnly);
                  const canOpenPractice =
                    !locked &&
                    !roadmap.readOnly &&
                    (lessonItem.practiceStatus === 'available' ||
                      lessonItem.apiStatus === 'Practicing');
                  const reportLink = lessonItem.practiceReportId
                    ? `/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/report`
                    : null;

                  return (
                    <li
                      key={lessonItem.id}
                      className="rounded-xl border border-info/30 bg-surface-overlay/70 px-4 py-4 shadow-[inset_3px_0_0_rgba(124,58,237,0.9)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="flex items-center gap-3 font-medium text-foreground"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-info/40 bg-info/10 text-info"><LessonIcon index={lessonIndex} /></span>{lessonTitle}</p>
                          <p className="text-caption text-muted-foreground">
                            {t('practice.learningPath.theory')}:{' '}
                            {t(`practice.learningPath.part.${lessonItem.theoryStatus}`)} ·{' '}
                            {t('practice.learningPath.practice')}:{' '}
                            {t(`practice.learningPath.part.${lessonItem.practiceStatus}`)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {canOpenTheory ? (
                            <Link
                              to={`/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/theory`}
                              className="inline-flex items-center gap-2 rounded-xl border border-info/70 bg-info/10 px-4 py-2.5 text-xs font-semibold text-foreground shadow-[0_0_24px_-10px_var(--color-info)] transition-colors hover:bg-info/20"
                            >
                              <BookOpen className="size-4 text-info" aria-hidden />
                              {t('practice.learningPath.openTheory')}
                            </Link>
                          ) : null}
                          {canOpenPractice ? (
                            <button
                              type="button"
                              className="btn-primary inline-flex text-xs"
                              disabled={launchingLessonId === lessonItem.id}
                              onClick={() =>
                                void openPractice(lessonItem.id, lessonTitle, lessonItem.sessionId)
                              }
                            >
                              {launchingLessonId === lessonItem.id
                                ? t('practice.learningPath.saving')
                                : lessonItem.apiStatus === 'Practicing'
                                  ? t('practice.learningPath.continuePracticeSession')
                                  : t('practice.learningPath.openPractice')}
                            </button>
                          ) : null}
                          {lessonItem.apiStatus === 'Done' ? (
                            <Link
                              to={`/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/theory`}
                              className="btn-secondary inline-flex text-xs"
                            >
                              {t('practice.learningPath.reviewLesson')}
                            </Link>
                          ) : null}
                          {reportLink ? (
                            <Link to={reportLink} className="btn-ghost inline-flex text-xs">
                              {t('practice.learningPath.viewReport')}
                            </Link>
                          ) : null}
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
    </div>
  );
}

function LessonIcon({ index }: { index: number }) {
  const Icon = [FileCode2, Database, BrainCircuit][index % 3] ?? BookOpen;
  return <Icon className="size-5" aria-hidden />;
}
