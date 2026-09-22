import type { ChangeEvent } from 'react';
import { TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { EditableRubricCriterion } from '../types/rubric.types';

interface RubricCriterionSelectionRowProps {
  criterion: EditableRubricCriterion;
  index: number;
  selected: boolean;
  disabled?: boolean;
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function RubricCriterionSelectionRow({
  criterion,
  index,
  selected,
  disabled = false,
  onToggle,
}: RubricCriterionSelectionRowProps) {
  const { t } = useLanguage();
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <TableRow data-state={selected ? 'selected' : undefined}>
      <td className="w-12 px-3 py-3 align-top text-center">
        <input
          type="checkbox"
          checked={selected}
          disabled={disabled}
          onChange={onToggle}
          aria-label={`${t('rubrics.criterion.select')}: ${criterion.name}`}
          className="mt-1 size-4 rounded border-satin accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]"
        />
      </td>
      <td className="w-10 px-2 py-3 align-top text-center text-sm font-semibold text-muted-foreground">
        <span>{indexLabel}</span>
      </td>
      <td className="min-w-[10rem] px-2 py-3 align-top">
        <p className="font-semibold text-foreground">{criterion.name}</p>
      </td>
      <td className="min-w-[14rem] px-2 py-3 align-top text-sm leading-6 text-muted-foreground">
        {criterion.description || '—'}
      </td>
      <td className="w-28 px-2 py-3 align-top text-sm font-semibold text-foreground">
        {criterion.weightPercent}%
      </td>
      <td className="w-24 px-2 py-3 align-top text-sm font-semibold text-foreground">
        {criterion.maxScore}
      </td>
    </TableRow>
  );
}
