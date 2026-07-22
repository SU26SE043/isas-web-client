import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
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
        navigate(learningInterviewPreparePath(sessionId));
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
      navigate(learningInterviewPreparePath(result.session.sessionId));
    } catch {
      setLaunchingLessonId(null);
    }
  };

  return (
    <div className="page-container page-section min-h-screen">
      <Link to="/candidate/learning" className="text-sm text-muted-foreground hover:text-foreground">
        {t('practice.learningPath.backToDashboard')}
      </Link>

      <header className="mt-4 space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {(language === 'vi' ? roadmap.domainLabelVi : roadmap.domainLabel)} ·{' '}
          {t(`practice.roadmapWizard.level.${roadmap.targetLevel}`)} ·{' '}
          {t(`practice.learningPath.status.${roadmap.status}`)}
          {roadmap.readOnly ? ` · ${t('practice.learningPath.readOnly')}` : ''}
        </p>
        <div className="max-w-md">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>{t('practice.learningPath.progress')}</span>
            <span>{roadmap.progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
            <div className="h-full bg-foreground/80" style={{ width: `${roadmap.progressPercent}%` }} />
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
              className="rounded-xl border border-subtle bg-surface-raised/70 p-5 backdrop-blur-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="heading-secondary text-lg text-foreground">
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
                {milestone.lessons.map((lessonItem) => {
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
                      className="rounded-lg border border-subtle bg-surface-overlay px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">{lessonTitle}</p>
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
                              className="btn-secondary inline-flex text-xs"
                            >
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
