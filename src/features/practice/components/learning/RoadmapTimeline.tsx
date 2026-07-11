import { Link } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { RoadmapStep } from '../../types/learning.types';

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
}

export function RoadmapTimeline({ steps }: RoadmapTimelineProps) {
  const { t, language } = useLanguage();

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const title = language === 'vi' ? step.titleVi : step.title;
        const description = language === 'vi' ? step.descriptionVi : step.description;
        const skillTag = language === 'vi' ? step.skillTagVi : step.skillTag;

        return (
          <li key={step.id} className="relative rounded-xl border border-subtle bg-surface-raised p-5">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                {step.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-success" aria-hidden />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t('practice.roadmap.stepLabel').replace('{n}', String(index + 1))}
                  </span>
                  <span className="rounded-full bg-surface-overlay px-2 py-0.5 text-xs text-foreground">
                    {skillTag}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('practice.roadmap.weeks').replace('{count}', String(step.estimatedWeeks))}
                  </span>
                </div>
                <h3 className="heading-secondary text-lg text-foreground">{title}</h3>
                <p className="body-text text-sm text-muted-foreground">{description}</p>
                {step.moduleId ? (
                  <Link to={`/candidate/learning/${step.moduleId}`} className="btn-secondary inline-flex text-sm">
                    {t('practice.roadmap.openModule')}
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
