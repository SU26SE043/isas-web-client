import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningPathService } from '../services/learningPath.service';
import type { LearningRoadmapDetail } from '../types/learningPath.types';
import {
  launchLearningInterviewPractice,
  learningInterviewPreparePath,
} from '../utils/launchLearningInterviewPractice';

export function LearningRoadmapDetailPage() {
  const { roadmapId = '' } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [roadmap, setRoadmap] = useState<LearningRoadmapDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [launchingLessonId, setLaunchingLessonId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void learningPathService
      .getRoadmap(roadmapId)
      .then((data) => {
        if (active) {
          setRoadmap(data);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [roadmapId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (error || !roadmap) {
    return <p className="page-container page-section text-sm text-error">{t('practice.learningPath.error')}</p>;
  }

  const title = language === 'vi' ? roadmap.nameVi : roadmap.name;

  const openPractice = async (lessonId: string, lessonTitle: string) => {
    setLaunchingLessonId(lessonId);
    try {
      const sessionId = await launchLearningInterviewPractice({
        roadmapId: roadmap.id,
        lessonId,
        title: lessonTitle,
      });
      navigate(learningInterviewPreparePath(sessionId));
    } catch {
      setError(true);
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
                    !roadmap.readOnly &&
                    (lessonItem.theoryStatus === 'available' || lessonItem.theoryStatus === 'completed');
                  const canOpenPractice =
                    !locked &&
                    lessonItem.practiceStatus === 'available' &&
                    !roadmap.readOnly;
                  const reportLink =
                    lessonItem.practiceReportId
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
                          {canOpenTheory || (roadmap.readOnly && lessonItem.theoryStatus === 'completed') ? (
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
                              onClick={() => void openPractice(lessonItem.id, lessonTitle)}
                            >
                              {launchingLessonId === lessonItem.id
                                ? t('practice.learningPath.saving')
                                : t('practice.learningPath.openPractice')}
                            </button>
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
