import { useEffect, useRef } from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { EditableRubricCriterion } from '../types/rubric.types';

interface RubricCriterionRowProps {
  criterion: EditableRubricCriterion;
  index: number;
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (patch: Partial<EditableRubricCriterion>) => void;
  onRemove: () => void;
}

const inputClassName =
  'h-9 min-w-0 rounded-lg border-satin bg-surface-overlay/80 text-sm shadow-[var(--satin-inset)]';

const descriptionClassName =
  'min-h-[72px] w-full min-w-0 resize-y rounded-lg border border-satin bg-surface-overlay/80 px-3 py-2 text-sm shadow-[var(--satin-inset)] whitespace-pre-wrap break-words transition-[border-color,box-shadow,background-color] duration-200 ease-out outline-none placeholder:text-muted-foreground focus-visible:border-[var(--border-focus)] focus-visible:ring-3 focus-visible:ring-[color-mix(in_srgb,var(--isas-silver-100)_22%,transparent)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50';

export function RubricCriterionRow({
  criterion,
  index,
  disabled = false,
  autoFocus = false,
  onChange,
  onRemove,
}: RubricCriterionRowProps) {
  const { t } = useLanguage();
  const nameRef = useRef<HTMLInputElement>(null);
  const indexLabel = String(index + 1).padStart(2, '0');

  useEffect(() => {
    if (autoFocus) nameRef.current?.focus();
  }, [autoFocus]);

  return (
    <tr>
      <td className="w-8 px-2 py-3 align-top text-muted-foreground">
        <GripVertical className="mx-auto mt-2 size-4" aria-hidden />
      </td>
      <td className="w-10 px-2 py-3 align-top text-center text-sm font-semibold text-muted-foreground">
        <span className="mt-2 inline-block">{indexLabel}</span>
      </td>
      <td className="min-w-[10rem] px-2 py-3 align-top">
        <label className="sr-only" htmlFor={`rubric-name-${criterion.clientId}`}>
          {t('rubrics.criterion.name')}
        </label>
        <Input
          ref={nameRef}
          id={`rubric-name-${criterion.clientId}`}
          value={criterion.name}
          disabled={disabled}
          onChange={(event) => onChange({ name: event.target.value })}
          className={inputClassName}
          aria-required
        />
      </td>
      <td className="min-w-[14rem] px-2 py-3 align-top">
        <label className="sr-only" htmlFor={`rubric-desc-${criterion.clientId}`}>
          {t('rubrics.criterion.description')}
        </label>
        <textarea
          id={`rubric-desc-${criterion.clientId}`}
          rows={2}
          value={criterion.description}
          disabled={disabled}
          onChange={(event) => onChange({ description: event.target.value })}
          className={descriptionClassName}
        />
      </td>
      <td className="w-28 px-2 py-3 align-top">
        <label className="sr-only" htmlFor={`rubric-weight-${criterion.clientId}`}>
          {t('rubrics.criterion.weight')}
        </label>
        <div className="relative">
          <Input
            id={`rubric-weight-${criterion.clientId}`}
            type="number"
            min={0}
            max={100}
            step={0.1}
            disabled={disabled}
            value={criterion.weightPercent}
            onChange={(event) => onChange({ weightPercent: Number(event.target.value) })}
            className={cn(inputClassName, 'pr-7')}
          />
          <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs text-muted-foreground">
            %
          </span>
        </div>
      </td>
      <td className="w-24 px-2 py-3 align-top">
        <label className="sr-only" htmlFor={`rubric-max-${criterion.clientId}`}>
          {t('rubrics.criterion.maxScore')}
        </label>
        <Input
          id={`rubric-max-${criterion.clientId}`}
          type="number"
          min={1}
          step={1}
          disabled={disabled}
          value={criterion.maxScore}
          onChange={(event) => onChange({ maxScore: Number(event.target.value) })}
          className={inputClassName}
        />
      </td>
      <td className="w-12 px-2 py-3 align-top">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={disabled}
          onClick={onRemove}
          aria-label={t('rubrics.criterion.remove')}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </Button>
      </td>
    </tr>
  );
}
