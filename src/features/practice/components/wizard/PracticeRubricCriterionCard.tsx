import React from 'react';
import {
  Layers,
  MessageCircle,
  Pencil,
  Rocket,
  Users,
  ClipboardList,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { PracticeRubricCriterion } from '../../types/practiceSetup.types';
import { PracticeRubricWeightRing } from './PracticeRubricWeightRing';

const CRITERION_ICONS: Record<string, React.ReactNode> = {
  'technical-depth': <Layers className="size-4" aria-hidden />,
  communication: <MessageCircle className="size-4" aria-hidden />,
  delivery: <Rocket className="size-4" aria-hidden />,
  'culture-fit': <Users className="size-4" aria-hidden />,
};

interface PracticeRubricCriterionCardProps {
  criterion: PracticeRubricCriterion;
  index: number;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChange: (patch: Partial<PracticeRubricCriterion>) => void;
}

export const PracticeRubricCriterionCard: React.FC<PracticeRubricCriterionCardProps> = ({
  criterion,
  index,
  isEditing,
  onToggleEdit,
  onChange,
}) => {
  const { t } = useLanguage();
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <article
      className={cn(
        'rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition-[border-color,background-color] duration-200 ease-out',
        isEditing ? 'border-white/20 bg-white/[0.05]' : null,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/[0.06] text-xs font-semibold text-foreground">
          {indexLabel}
        </span>

        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-foreground">
          {CRITERION_ICONS[criterion.id] ?? <ClipboardList className="size-4" aria-hidden />}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground">
            <span className="text-muted-foreground">{t('practice.wizard.rubric.name')}</span>{' '}
            <span className="font-semibold">{criterion.name}</span>
          </p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            <span className="text-muted-foreground/80">{t('practice.wizard.rubric.criterionDesc')}</span>{' '}
            {criterion.description}
          </p>
        </div>

        <PracticeRubricWeightRing
          weight={criterion.weight}
          label={t('practice.wizard.rubric.weight')}
          className="hidden shrink-0 sm:flex"
        />

        <button
          type="button"
          onClick={onToggleEdit}
          className={cn(
            'mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-transparent text-muted-foreground transition-[background-color,color,border-color] duration-200 ease-out hover:border-white/20 hover:bg-white/[0.05] hover:text-foreground',
            isEditing ? 'border-white/25 bg-white/[0.08] text-foreground' : null,
          )}
          aria-expanded={isEditing}
          aria-label={
            isEditing ? t('practice.wizard.rubric.doneEdit') : t('practice.wizard.rubric.edit')
          }
        >
          <Pencil className="size-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex justify-end sm:hidden">
        <PracticeRubricWeightRing
          weight={criterion.weight}
          label={t('practice.wizard.rubric.weight')}
        />
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-3 border-t border-white/8 pt-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_96px]">
            <div>
              <Label htmlFor={`rubric-name-${criterion.id}`}>{t('practice.wizard.rubric.name')}</Label>
              <Input
                id={`rubric-name-${criterion.id}`}
                value={criterion.name}
                onChange={(event) => onChange({ name: event.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`rubric-weight-${criterion.id}`}>{t('practice.wizard.rubric.weight')}</Label>
              <Input
                id={`rubric-weight-${criterion.id}`}
                type="number"
                min={0}
                max={100}
                value={criterion.weight}
                onChange={(event) => onChange({ weight: Number(event.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`rubric-desc-${criterion.id}`}>{t('practice.wizard.rubric.criterionDesc')}</Label>
            <Input
              id={`rubric-desc-${criterion.id}`}
              value={criterion.description}
              onChange={(event) => onChange({ description: event.target.value })}
              className="mt-1"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
};
