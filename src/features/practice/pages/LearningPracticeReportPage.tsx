import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { PracticeLiveResultReport } from '../components/result/PracticeLiveResultReport';
import { getPracticeSession } from '../services/b2cPracticeSession.service';
import {
  invalidateLearningRoadmapDetail,
  useLearningRoadmapDetail,
} from '../hooks/useLearningRoadmaps';
import { findNextLesson, theoryPath } from '../utils/learningPathNavigation';

export function LearningPracticeReportPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const [params] = useSearchParams();
  const sessionId = params.get('sessionId') ?? '';
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const roadmapQuery = useLearningRoadmapDetail(roadmapId);

  const sessionQuery = useQuery({
    queryKey: ['learning', 'practice-session-report', sessionId],
    queryFn: () => getPracticeSession(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'Scored') return false;
      return 3000;
    },
  });

  const session = sessionQuery.data;
  const isScored = session?.status === 'Scored' && Boolean(session.result);
  const roadmap = roadmapQuery.data;
  const nextLesson = roadmap ? findNextLesson(roadmap, lessonId) : null;

  if (!sessionId) {
    return (
      <p className="page-container page-section text-sm text-error">
        {t('practice.learningPath.sessionReportMissing')}
      </p>
    );
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <div className="page-container page-section min-h-[50vh]">
        <EmptyState
          className="frame-satin mx-auto max-w-lg"
          title={t('practice.learningPath.errorTitle')}
          description={t('practice.learningPath.error')}
          action={
            <Button type="button" onClick={() => void sessionQuery.refetch()}>
              <AlertCircle className="size-4" aria-hidden />
              {t('practice.learningPath.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  if (!isScored || !session?.result) {
    return (
      <div className="page-container page-section flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">{t('practice.scoring.description')}</p>
      </div>
    );
  }

  return (
    <PracticeLiveResultReport
      session={session}
      actions={
        <>
          {nextLesson ? (
            <Link
              to={theoryPath(roadmapId, nextLesson.id)}
              className="btn-primary inline-flex"
              onClick={() => void invalidateLearningRoadmapDetail(queryClient, roadmapId)}
            >
              {t('practice.learningPath.nextLesson')}
            </Link>
          ) : null}
          <Link
            to={`/candidate/learning/roadmaps/${roadmapId}`}
            className="btn-secondary inline-flex"
            onClick={() => void invalidateLearningRoadmapDetail(queryClient, roadmapId)}
          >
            {t('practice.learningPath.backToRoadmap')}
          </Link>
          {roadmap?.status === 'completed' ? (
            <Link
              to={`/candidate/learning/roadmaps/${roadmapId}/report`}
              className="btn-ghost inline-flex"
            >
              {t('practice.learningPath.viewRoadmapReport')}
            </Link>
          ) : null}
        </>
      }
    />
  );
}
