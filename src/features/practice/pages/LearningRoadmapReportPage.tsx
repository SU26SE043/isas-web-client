import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/patterns/EmptyState';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { roadmapPracticeService } from '../services/roadmapPractice.service';

export function LearningRoadmapReportPage() {
  const { roadmapId = '' } = useParams();
  const { language, t } = useLanguage();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['learning', 'roadmap-report', roadmapId],
    queryFn: () => roadmapPracticeService.getRoadmapReport(roadmapId),
    enabled: Boolean(roadmapId),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" role="status">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
        <span className="sr-only">{t('practice.learningPath.loadingReport')}</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="page-container page-section min-h-[50vh]">
        <EmptyState
          className="frame-satin mx-auto max-w-lg"
          title={t('practice.learningPath.errorTitle')}
          description={t('practice.learningPath.reportLoadError')}
          action={
            <Button type="button" onClick={() => void refetch()} disabled={isFetching}>
              <AlertCircle className="size-4" aria-hidden />
              {t('practice.learningPath.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  const kindLabel =
    data.kind === 'snapshot'
      ? t('practice.learningPath.reportKindSnapshot')
      : t('practice.learningPath.reportKindInterim');
  const level =
    language === 'vi'
      ? data.levelEvaluationVi || data.levelEvaluation
      : data.levelEvaluation || data.levelEvaluationVi;
  const comment =
    language === 'vi'
      ? data.overallCommentVi || data.overallComment
      : data.overallComment || data.overallCommentVi;

  return (
    <div className="page-container page-section min-h-full space-y-6 py-8">
      <header className="space-y-2">
        <p className="text-caption text-muted-foreground">{kindLabel}</p>
        <h1 className="heading-primary text-3xl text-foreground">
          {t('practice.learningPath.roadmapReportTitle')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('practice.learningPath.roadmapReportSubtitle')}
        </p>
      </header>

      {data.radarData.length > 0 ? (
        <SkillRadarChart data={data.radarData} language={language} />
      ) : (
        <p className="text-sm text-muted-foreground">{t('practice.learningPath.radarEmpty')}</p>
      )}

      {level ? (
        <section className="rounded-xl border border-subtle bg-surface-raised p-5">
          <h2 className="heading-secondary text-lg text-foreground">
            {t('practice.learningPath.levelEvaluation')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{level}</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <ListBlock
          title={t('practice.learningPath.strengths')}
          items={language === 'vi' ? data.strengthsVi : data.strengths}
        />
        <ListBlock
          title={t('practice.learningPath.weaknesses')}
          items={language === 'vi' ? data.weaknessesVi : data.weaknesses}
        />
        <ListBlock
          title={t('practice.learningPath.improvements')}
          items={language === 'vi' ? data.improvementsVi : data.improvements}
        />
      </section>

      {comment ? (
        <section className="rounded-xl border border-subtle bg-surface-raised p-5">
          <h2 className="heading-secondary text-lg text-foreground">
            {t('practice.learningPath.overallComment')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{comment}</p>
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3 border-t border-subtle pt-6">
        <Link to={`/candidate/learning/roadmaps/${roadmapId}`} className="btn-primary inline-flex">
          {t('practice.learningPath.backToRoadmap')}
        </Link>
        <Link to="/candidate/learning" className="btn-secondary inline-flex">
          {t('practice.learningPath.backToDashboard')}
        </Link>
      </div>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-5">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">—</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
