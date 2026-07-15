import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { QuestionFeedbackReport } from '../components/learning-path/QuestionFeedbackReport';
import { learningPathService } from '../services/learningPath.service';
import type { LearningPracticeReport, LearningRoadmapDetail } from '../types/learningPath.types';
import { findNextLesson, theoryPath } from '../utils/learningPathNavigation';

export function LearningPracticeReportPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const [params] = useSearchParams();
  const reportId = params.get('reportId');
  const { language, t } = useLanguage();
  const [report, setReport] = useState<LearningPracticeReport | null>(null);
  const [roadmap, setRoadmap] = useState<LearningRoadmapDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const roadmapData = await learningPathService.getRoadmap(roadmapId);
        let resolvedId: string | null = reportId;
        if (!resolvedId) {
          const lesson = roadmapData.milestones
            .flatMap((item) => item.lessons)
            .find((item) => item.id === lessonId);
          resolvedId =
            lesson?.practiceReportId ??
            roadmapData.reports.find((item) => item.lessonId === lessonId)?.id ??
            null;
        }
        if (!resolvedId) throw new Error('missing');
        const data = await learningPathService.getReport(roadmapId, resolvedId);
        if (active) {
          setReport(data);
          setRoadmap(roadmapData);
        }
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

  const nextLesson = roadmap ? findNextLesson(roadmap, lessonId) : null;

  return (
    <div className="page-container page-section min-h-full py-8">
      <header className="space-y-2">
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

      {report.questionFeedback.length > 0 ? (
        <section className="mt-8 space-y-4">
          <h2 className="heading-secondary text-xl text-foreground">
            {t('practice.learningPath.questionReportsSection')}
          </h2>
          <div className="space-y-4">
            {report.questionFeedback.map((item, index) => (
              <QuestionFeedbackReport
                key={item.questionId}
                feedback={item.feedback}
                language={language}
                prompt={item.prompt}
                promptVi={item.promptVi}
                questionNumber={index + 1}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3 border-t border-subtle pt-6">
        {nextLesson ? (
          <Link to={theoryPath(roadmapId, nextLesson.id)} className="btn-primary inline-flex">
            {t('practice.learningPath.nextLesson')}
          </Link>
        ) : null}
        <Link to={`/candidate/learning/roadmaps/${roadmapId}`} className="btn-secondary inline-flex">
          {t('practice.learningPath.backToRoadmap')}
        </Link>
      </div>
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
