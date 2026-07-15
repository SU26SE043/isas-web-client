import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { LearningRoadmapCard } from '../../types/learningPath.types';
import { continueLearningPath } from '../../utils/learningPathNavigation';

interface LearningRoadmapCardViewProps {
  roadmap: LearningRoadmapCard;
}

export const LearningRoadmapCardView: React.FC<LearningRoadmapCardViewProps> = ({ roadmap }) => {
  const { language, t } = useLanguage();
  const name = language === 'vi' ? roadmap.nameVi : roadmap.name;
  const domain = language === 'vi' ? roadmap.domainLabelVi : roadmap.domainLabel;
  const milestone = language === 'vi' ? roadmap.currentMilestoneTitleVi : roadmap.currentMilestoneTitle;
  const lesson = language === 'vi' ? roadmap.currentLessonTitleVi : roadmap.currentLessonTitle;
  const updated = new Date(roadmap.updatedAt).toLocaleDateString(
    language === 'vi' ? 'vi-VN' : 'en-US',
  );

  return (
    <article className="rounded-xl border border-subtle bg-surface-raised/80 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="heading-secondary text-lg text-foreground">{name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {domain} · {t(`practice.roadmapWizard.level.${roadmap.targetLevel}`)}
          </p>
        </div>
        <span
          className={
            roadmap.status === 'completed'
              ? 'rounded-full border border-success/30 bg-success-bg px-3 py-1 text-xs text-success'
              : roadmap.status === 'in_progress'
                ? 'rounded-full border border-info/30 bg-info-bg px-3 py-1 text-xs text-info'
                : 'rounded-full border border-subtle px-3 py-1 text-xs text-muted-foreground'
          }
        >
          {t(`practice.learningPath.status.${roadmap.status}`)}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>{t('practice.learningPath.progress')}</span>
          <span
            className={
              roadmap.status === 'completed' ? 'text-success' : 'text-muted-foreground'
            }
          >
            {roadmap.progressPercent}%
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
          <div
            className={
              roadmap.status === 'completed'
                ? 'h-full rounded-full bg-success transition-[width] duration-300'
                : 'h-full rounded-full bg-foreground/80 transition-[width] duration-300'
            }
            style={{ width: `${roadmap.progressPercent}%` }}
          />
        </div>
      </div>

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-caption text-muted-foreground">{t('practice.learningPath.currentMilestone')}</dt>
          <dd className="text-foreground">{milestone || '—'}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">{t('practice.learningPath.currentLesson')}</dt>
          <dd className="text-foreground">{lesson || '—'}</dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">{t('practice.learningPath.remaining')}</dt>
          <dd className="text-foreground">
            {t('practice.learningPath.hours').replace('{count}', String(roadmap.estimatedRemainingHours))}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-muted-foreground">{t('practice.learningPath.updated')}</dt>
          <dd className="text-foreground">{updated}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-3">
        {!roadmap.readOnly ? (
          <Link to={continueLearningPath(roadmap)} className="btn-primary inline-flex">
            {t('practice.learningPath.continue')}
          </Link>
        ) : null}
        <Link to={`/candidate/learning/roadmaps/${roadmap.id}`} className="btn-secondary inline-flex">
          {t('practice.learningPath.viewDetails')}
        </Link>
      </div>
    </article>
  );
};
