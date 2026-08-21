import { Link } from 'react-router-dom';
import { BookOpen, BrainCircuit, Database, FileCode2, Lock, Star } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapDetail } from '../../types/learningPath.types';

interface LearningRoadmapMilestonesProps {
  roadmap: LearningRoadmapDetail;
  language: string;
  launchingLessonId: string | null;
  onOpenPractice: (lessonId: string, title: string, sessionId?: string | null) => void;
}

export function LearningRoadmapMilestones({ roadmap, language, launchingLessonId, onOpenPractice }: LearningRoadmapMilestonesProps) {
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
            <ul className="mt-4 space-y-2">
              {milestone.lessons.map((lessonItem, lessonIndex) => {
                const lessonTitle = language === 'vi' ? lessonItem.titleVi : lessonItem.title;
                const canOpenTheory = !locked && (lessonItem.theoryStatus === 'available' || lessonItem.theoryStatus === 'completed' || roadmap.readOnly);
                const canOpenPractice = !locked && !roadmap.readOnly && (lessonItem.practiceStatus === 'available' || lessonItem.apiStatus === 'Practicing');
                const reportLink = lessonItem.practiceReportId ? `/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/report` : null;
                return (
                  <li key={lessonItem.id} className="rounded-xl border border-info/30 bg-surface-overlay/70 px-4 py-4 shadow-[inset_3px_0_0_rgba(124,58,237,0.9)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="flex items-center gap-3 font-medium text-foreground"><span className="grid size-10 shrink-0 place-items-center rounded-xl border border-info/40 bg-info/10 text-info"><LessonIcon index={lessonIndex} /></span>{lessonTitle}</p>
                        <p className="text-caption text-muted-foreground">{t('practice.learningPath.theory')}: {t(`practice.learningPath.part.${lessonItem.theoryStatus}`)} · {t('practice.learningPath.practice')}: {t(`practice.learningPath.part.${lessonItem.practiceStatus}`)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {canOpenTheory ? <Link to={`/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/theory`} className="inline-flex items-center gap-2 rounded-xl border border-info/70 bg-info/10 px-4 py-2.5 text-xs font-semibold text-foreground"><BookOpen className="size-4 text-info" aria-hidden />{t('practice.learningPath.openTheory')}</Link> : null}
                        {canOpenPractice ? <button type="button" className="btn-primary inline-flex text-xs" disabled={launchingLessonId === lessonItem.id} onClick={() => onOpenPractice(lessonItem.id, lessonTitle, lessonItem.sessionId)}>{launchingLessonId === lessonItem.id ? t('practice.learningPath.saving') : lessonItem.apiStatus === 'Practicing' ? t('practice.learningPath.continuePracticeSession') : t('practice.learningPath.openPractice')}</button> : null}
                        {lessonItem.apiStatus === 'Done' ? <Link to={`/candidate/learning/roadmaps/${roadmap.id}/lessons/${lessonItem.id}/theory`} className="btn-secondary inline-flex text-xs">{t('practice.learningPath.reviewLesson')}</Link> : null}
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
