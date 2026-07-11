import { Link } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import type { LearningModule } from '../../types/learning.types';

interface LearningModuleCardProps {
  module: LearningModule;
}

const statusKey = {
  not_started: 'practice.learning.status.notStarted',
  in_progress: 'practice.learning.status.inProgress',
  completed: 'practice.learning.status.completed',
} as const;

export function LearningModuleCard({ module }: LearningModuleCardProps) {
  const { t, language } = useLanguage();
  const title = language === 'vi' ? module.titleVi : module.title;
  const description = language === 'vi' ? module.descriptionVi : module.description;
  const skillTag = language === 'vi' ? module.skillTagVi : module.skillTag;

  return (
    <article className="flex h-full flex-col rounded-xl border border-subtle bg-surface-raised p-5">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-xs text-foreground">{skillTag}</span>
        <span className="text-xs font-medium text-muted-foreground">{t(statusKey[module.status])}</span>
      </div>
      <h3 className="heading-secondary mt-3 text-lg text-foreground">{title}</h3>
      <p className="body-text mt-2 flex-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('practice.learning.progress')}</span>
            <span>{module.progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${module.progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {t('practice.learning.duration').replace('{minutes}', String(module.durationMinutes))}
          </span>
          <Link to={`/candidate/learning/${module.id}`} className="btn-primary text-sm">
            {t('practice.learning.open')}
          </Link>
        </div>
      </div>
    </article>
  );
}
