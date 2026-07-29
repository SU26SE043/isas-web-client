import { Link, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/shared/languages';
import { LessonHtmlContent } from '../components/learning-path/LessonHtmlContent';
import { LearningTheoryActions } from '../components/learning-path/LearningTheoryActions';
import { LearningResourceList } from '../components/learning-path/LearningResourceList';
import { useLearningWorkspaceOptional } from '../context/LearningWorkspaceContext';
import { useLearningLesson, useLearningRoadmapDetail } from '../hooks/useLearningRoadmaps';
import { roadmapService } from '../services/roadmap.service';

function TheorySkeleton() {
  return (
    <div className="mx-auto max-w-[900px] space-y-6 px-4 py-8 sm:px-6 lg:px-10" aria-busy="true">
      <div className="space-y-3 border-b border-subtle pb-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-3/4 max-w-md" />
      </div>
      <div className="frame-satin space-y-4 rounded-2xl border border-subtle bg-surface-raised p-6 sm:p-8">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    </div>
  );
}

export function LearningTheoryPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const { language, t } = useLanguage();
  const workspace = useLearningWorkspaceOptional();

  const roadmapQuery = useLearningRoadmapDetail(roadmapId);
  const lessonQuery = useLearningLesson(roadmapId, lessonId, Boolean(roadmapId && lessonId));

  const roadmap = workspace?.roadmap ?? roadmapQuery.data ?? null;
  const opened = lessonQuery.data;
  const errorStatus = lessonQuery.isError
    ? roadmapService.getErrorStatus(lessonQuery.error)
    : roadmapQuery.isError
      ? roadmapService.getErrorStatus(roadmapQuery.error)
      : workspace?.errorStatus;

  const showSkeleton =
    (lessonQuery.isLoading || lessonQuery.isFetching) && !opened;

  if (showSkeleton) {
    return (
      <div className="min-h-full overflow-y-auto bg-surface-base">
        <TheorySkeleton />
        <span className="sr-only">{t('practice.learningPath.loadingTheory')}</span>
      </div>
    );
  }

  if (lessonQuery.isError || !opened) {
    const isNotFound = errorStatus === 404;
    const isForbidden = errorStatus === 403;
    const isAiFailure = errorStatus === 502;
    return (
      <div className="page-container page-section min-h-[50vh]">
        <EmptyState
          className="frame-satin mx-auto max-w-lg"
          variant={isForbidden ? 'no-permission' : 'no-results'}
          title={
            isAiFailure
              ? t('practice.learningPath.lessonAiErrorTitle')
              : isNotFound
                ? t('practice.learningPath.errorNotFoundTitle')
                : isForbidden
                  ? t('practice.learningPath.errorForbiddenTitle')
                  : t('practice.learningPath.errorTitle')
          }
          description={
            isAiFailure
              ? t('practice.learningPath.lessonAiError')
              : isNotFound
                ? t('practice.learningPath.errorNotFound')
                : isForbidden
                  ? t('practice.learningPath.errorForbidden')
                  : t('practice.learningPath.error')
          }
          action={
            isAiFailure || (!isNotFound && !isForbidden) ? (
              <Button
                type="button"
                onClick={() => void lessonQuery.refetch()}
                disabled={lessonQuery.isFetching}
              >
                <AlertCircle className="size-4" aria-hidden />
                {t('practice.learningPath.retry')}
              </Button>
            ) : (
              <Link to="/candidate/learning" className="btn-secondary inline-flex">
                {t('practice.learningPath.backToDashboard')}
              </Link>
            )
          }
        />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="page-container page-section min-h-[50vh]">
        <EmptyState
          className="frame-satin mx-auto max-w-lg"
          title={t('practice.learningPath.errorTitle')}
          description={t('practice.learningPath.error')}
          action={
            <Button type="button" onClick={() => void roadmapQuery.refetch()}>
              {t('practice.learningPath.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  const title = language === 'vi' ? opened.titleVi : opened.title;
  const html = opened.theoryContent.trim();

  return (
    <div className="min-h-full overflow-y-auto bg-surface-base">
      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <header className="space-y-2 border-b border-subtle pb-6">
          <p className="text-caption text-muted-foreground">{t('practice.learningPath.theory')}</p>
          <h1 className="heading-primary text-3xl text-foreground sm:text-4xl">{title}</h1>
          {opened.apiStatus === 'Done' ? (
            <p className="text-sm text-success">{t('practice.learningPath.lessonDoneHint')}</p>
          ) : null}
        </header>

        <article className="frame-satin mt-8 rounded-2xl border border-subtle bg-surface-raised p-6 sm:p-8 lg:p-10">
          {html ? (
            <LessonHtmlContent html={html} />
          ) : (
            <p className="text-sm text-muted-foreground">{t('practice.learningPath.theoryEmpty')}</p>
          )}
          <LearningResourceList resources={opened.resources ?? []} />
        </article>

        <LearningTheoryActions roadmap={roadmap} opened={opened} />
      </div>
    </div>
  );
}
