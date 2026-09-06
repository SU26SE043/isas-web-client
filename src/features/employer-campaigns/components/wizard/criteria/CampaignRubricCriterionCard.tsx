import {
  ClipboardList,
  Layers,
  MessageCircle,
  Rocket,
  Trash2,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { RubricCriterion } from '../../../types/campaignManagement.types';

const CRITERION_ICONS = [
  <Layers className="size-4" aria-hidden key="layers" />,
  <MessageCircle className="size-4" aria-hidden key="message" />,
  <Rocket className="size-4" aria-hidden key="rocket" />,
  <Users className="size-4" aria-hidden key="users" />,
];

interface CampaignRubricCriterionCardProps {
  criterion: RubricCriterion;
  index: number;
  contextLabel: string;
  disabled?: boolean;
  onChange: (patch: Partial<RubricCriterion>) => void;
  onRemove: () => void;
}

export function CampaignRubricCriterionCard({
  criterion,
  index,
  contextLabel,
  disabled = false,
  onChange,
  onRemove,
}: CampaignRubricCriterionCardProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const indexLabel = String(index + 1).padStart(2, '0');
  const weight = Number(criterion.weight) || 0;
  const clamped = Math.max(0, Math.min(100, weight));
  // `maxScore` bên backend là Int32 (campaign_criteria.max_score) — số thập phân
  // bị từ chối bằng 400 `System.Int32`, tức lỗi chỉ lộ ra SAU khi employer bấm
  // lưu. Chặn ngay tại đây, và giữ `step={1}` ở ô nhập bên dưới.
  // `weight` thì ngược lại: numeric bên DB nên `step={0.1}` là đúng.
  const maxScoreValid =
    Number.isInteger(criterion.maxScore) && criterion.maxScore >= 1 && criterion.maxScore <= 10;

  return (
    <article className="frame-satin rounded-xl border border-satin bg-surface-raised/60 px-3 py-3 sm:px-4 sm:py-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1.1fr)_minmax(0,1.3fr)_7.5rem_7rem_auto] lg:items-start">
        <div className="flex min-w-0 items-start gap-3">
          <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-foreground">
            {indexLabel}
          </span>
          <span className="frame-satin-soft flex size-9 shrink-0 items-center justify-center rounded-full text-foreground">
            {CRITERION_ICONS[index % CRITERION_ICONS.length] ?? (
              <ClipboardList className="size-4" aria-hidden />
            )}
          </span>
          <div className="min-w-0 flex-1 space-y-1">
            <label className="sr-only" htmlFor={`campaign-rubric-name-${criterion.id}`}>
              {t('employer.campaigns.wizard.rubric.name')}
            </label>
            <Input
              id={`campaign-rubric-name-${criterion.id}`}
              value={criterion.name}
              maxLength={255}
              disabled={disabled}
              onChange={(event) => onChange({ name: event.target.value })}
              className="h-9 border-satin bg-surface-overlay/70 text-sm font-semibold"
            />
            <p className="truncate text-xs text-muted-foreground">{contextLabel}</p>
          </div>
        </div>

        <div className="min-w-0">
          <label className="sr-only" htmlFor={`campaign-rubric-desc-${criterion.id}`}>
            {t('employer.campaigns.wizard.rubric.criterionDesc')}
          </label>
          <textarea
            id={`campaign-rubric-desc-${criterion.id}`}
            rows={2}
            value={criterion.description}
            disabled={disabled}
            onChange={(event) => onChange({ description: event.target.value })}
            className="min-h-[72px] w-full resize-y rounded-lg border border-satin bg-surface-overlay/70 px-3 py-2 text-sm whitespace-pre-wrap break-words shadow-[var(--satin-inset)] outline-none transition-[border-color,box-shadow] duration-200 ease-out focus-visible:border-[var(--border-focus)] focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--isas-silver-100)_22%,transparent)] disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="w-full lg:w-auto">
          <p className="mb-1 text-xs font-medium text-muted-foreground lg:hidden">
            {t('employer.campaigns.wizard.rubric.weight')}
          </p>
          <label className="sr-only" htmlFor={`campaign-rubric-weight-${criterion.id}`}>
            {t('employer.campaigns.wizard.rubric.weight')}
          </label>
          <Input
            id={`campaign-rubric-weight-${criterion.id}`}
            type="number"
            min={0}
            max={100}
            step={0.1}
            disabled={disabled}
            value={criterion.weight}
            onChange={(event) => onChange({ weight: Number(event.target.value) })}
            className="h-9 border-satin bg-surface-overlay/70 text-sm"
          />
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-overlay">
            <div
              className={cn(
                'h-full rounded-full transition-[width,background-color] duration-300 ease-out',
                clamped > 0 ? 'bg-success' : 'bg-muted-foreground/40',
              )}
              style={{ width: `${clamped}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">{clamped}%</p>
        </div>

        <div className="w-full lg:w-auto">
          <p className="mb-1 text-xs font-medium text-muted-foreground lg:hidden">
            {t('employer.campaigns.wizard.rubric.maxScore')}
          </p>
          <label className="sr-only" htmlFor={`campaign-rubric-max-${criterion.id}`}>
            {t('employer.campaigns.wizard.rubric.maxScore')}
          </label>
          <Input
            id={`campaign-rubric-max-${criterion.id}`}
            type="number"
            min={1}
            max={10}
            step={1}
            disabled={disabled}
            value={criterion.maxScore}
            aria-invalid={!maxScoreValid}
            onChange={(event) => onChange({ maxScore: Number(event.target.value) })}
            className={cn(
              'h-9 border-satin bg-surface-overlay/70 text-sm',
              !maxScoreValid && 'border-error text-error aria-invalid:border-error',
            )}
          />
        </div>

        <div className="flex justify-end lg:pt-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            onClick={onRemove}
            aria-label={t('employer.campaigns.wizard.rubric.remove')}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      <button type="button" className="mt-3 flex w-full items-center justify-between border-t border-satin pt-2 text-left text-xs text-muted-foreground" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
        <span>{criterion.levels?.length ? <Badge variant="outline">{criterion.levels.length} {t('employer.campaigns.wizard.rubric.levels')}</Badge> : <Badge variant="outline">{t('employer.campaigns.wizard.rubric.noLevels')}</Badge>}</span>
        <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden />
      </button>
      {expanded ? <div className="mt-3 grid gap-3 border-t border-satin pt-3 sm:grid-cols-[1fr_8rem]">
        <div className="space-y-1">{criterion.levels?.map((level) => <p key={`${criterion.id}-${level.score}`} className="text-xs text-muted-foreground"><strong className="text-foreground">{level.score}</strong> · {level.descriptor}</p>)}</div>
        <div><label className="text-xs font-medium text-muted-foreground" htmlFor={`campaign-rubric-floor-${criterion.id}`}>{t('employer.campaigns.wizard.rubric.minPct')}</label><Input id={`campaign-rubric-floor-${criterion.id}`} type="number" min={0} value={criterion.minPct ?? ''} disabled={disabled} onChange={(event) => { const value = event.target.value.trim(); onChange({ minPct: value === '' ? null : Number(value) }); }} className="mt-1 h-9 border-satin bg-surface-overlay/70 text-sm" /><p className="mt-1 text-[11px] text-muted-foreground">{t('employer.campaigns.wizard.rubric.minPctHelp')}</p></div>
      </div> : null}
    </article>
  );
}
