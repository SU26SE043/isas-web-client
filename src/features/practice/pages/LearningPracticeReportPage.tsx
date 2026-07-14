import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningPathService } from '../services/learningPath.service';
import type { LearningPracticeReport } from '../types/learningPath.types';

export function LearningPracticeReportPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const [params] = useSearchParams();
  const reportId = params.get('reportId');
  const { language, t } = useLanguage();
  const [report, setReport] = useState<LearningPracticeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        let resolvedId: string | null = reportId;
        if (!resolvedId) {
          const roadmap = await learningPathService.getRoadmap(roadmapId);
          const lesson = roadmap.milestones
            .flatMap((item) => item.lessons)
            .find((item) => item.id === lessonId);
          resolvedId =
            lesson?.practiceReportId ??
            roadmap.reports.find((item) => item.lessonId === lessonId)?.id ??
            null;
        }
        if (!resolvedId) throw new Error('missing');
        const data = await learningPathService.getReport(roadmapId, resolvedId);
        if (active) setReport(data);
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [lessonId, reportId, roadmapId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (error || !report) {
    return <p className="page-container page-section text-sm text-error">{t('practice.learningPath.error')}</p>;
  }

  return (
    <div className="page-container page-section min-h-screen">
      <Link
        to={`/candidate/learning/roadmaps/${roadmapId}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('practice.learningPath.backToRoadmap')}
      </Link>

      <header className="mt-4 space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.learningPath.reportTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('practice.learningPath.reportSubtitle')}</p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <ScoreCard label={t('practice.learningPath.overallScore')} value={report.overallScore} />
        <ScoreCard label={t('practice.learningPath.technicalScore')} value={report.technicalScore} />
        <ScoreCard label={t('practice.learningPath.communicationScore')} value={report.communicationScore} />
      </div>

      <section className="mt-6 space-y-4 rounded-xl border border-subtle bg-surface-raised p-6">
        <p className="text-sm text-foreground">
          {language === 'vi' ? report.aiSummaryVi : report.aiSummary}
        </p>
        <ListBlock
          title={t('practice.learningPath.strengths')}
          items={language === 'vi' ? report.strengthsVi : report.strengths}
        />
        <ListBlock
          title={t('practice.learningPath.weaknesses')}
          items={language === 'vi' ? report.weaknessesVi : report.weaknesses}
        />
        <ListBlock
          title={t('practice.learningPath.gaps')}
          items={language === 'vi' ? report.knowledgeGapsVi : report.knowledgeGaps}
        />
        <ListBlock
          title={t('practice.learningPath.topics')}
          items={language === 'vi' ? report.recommendedTopicsVi : report.recommendedTopics}
        />
        <ListBlock
          title={t('practice.learningPath.nextActions')}
          items={language === 'vi' ? report.nextActionsVi : report.nextActions}
        />
      </section>
    </div>
  );
}

function ScoreCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-4 text-center">
      <p className="text-caption text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="heading-secondary text-base text-foreground">{title}</h2>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
