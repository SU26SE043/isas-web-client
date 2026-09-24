import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { EditableRubricCriterion } from '../types/rubric.types';
import { RubricCriterionRow } from './RubricCriterionRow';
import { RubricCriterionSelectionRow } from './RubricCriterionSelectionRow';

interface RubricCriteriaTableProps {
  criteria: EditableRubricCriterion[];
  mode?: 'edit' | 'select';
  disabled?: boolean;
  focusClientId?: string | null;
  validationMessage?: string | null;
  isDirty?: boolean;
  canSave?: boolean;
  isSaving?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  onAdd?: () => void;
  onSave?: () => void;
  onUpdate?: (clientId: string, patch: Partial<EditableRubricCriterion>) => void;
  onRemove?: (clientId: string) => void;
}

export function RubricCriteriaTable({
  criteria,
  mode = 'edit',
  disabled = false,
  focusClientId = null,
  validationMessage,
  isDirty = false,
  canSave = false,
  isSaving = false,
  selectedIds = [],
  onSelectionChange,
  onAdd,
  onSave,
  onUpdate,
  onRemove,
}: RubricCriteriaTableProps) {
  const { t } = useLanguage();
  const isSelectionMode = mode === 'select';
  const selectedSet = new Set(selectedIds);

  const handleSelectionChange = (criterionId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      checked
        ? [...selectedIds, criterionId]
        : selectedIds.filter((id) => id !== criterionId),
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="heading-secondary text-lg text-foreground">{t('rubrics.list.title')}</h3>
        {isSelectionMode ? (
          <span className="text-sm text-muted-foreground" aria-live="polite">
            {t('rubrics.selection.selectedCount')
              .replace('{selected}', String(selectedIds.length))
              .replace('{total}', String(criteria.length))}
          </span>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={onAdd} disabled={disabled}>
              <Plus className="size-4" aria-hidden />
              {t('rubrics.add')}
            </Button>
            <Button type="button" className="btn-primary" onClick={onSave} disabled={!canSave}>
              <Save className="size-4" aria-hidden />
              {isSaving ? t('rubrics.saveLoading') : t('rubrics.save')}
            </Button>
          </div>
        )}
      </div>

      {criteria.length === 0 ? (
        <EmptyState
          title={t('rubrics.empty.title')}
          description=""
          action={!isSelectionMode ? (
            <Button type="button" variant="secondary" onClick={onAdd} disabled={disabled}>
              {t('rubrics.empty.action')}
            </Button>
          ) : undefined}
        />
      ) : (
        <Table className="min-w-[56rem] border-collapse">
          <TableHeader>
            <TableRow>
              {isSelectionMode ? (
                <TableHead className="w-12 px-3">
                  <span className="sr-only">{t('rubrics.criterion.select')}</span>
                </TableHead>
              ) : (
                <TableHead className="w-8 px-2" aria-hidden />
              )}
              <TableHead className="w-10 px-2">#</TableHead>
              <TableHead className="px-2">{t('rubrics.criterion.name')}</TableHead>
              <TableHead className="px-2">{t('rubrics.criterion.description')}</TableHead>
              <TableHead className="w-28 px-2">{t('rubrics.criterion.weight')}</TableHead>
              <TableHead className="w-24 px-2">{t('rubrics.criterion.maxScore')}</TableHead>
              {!isSelectionMode ? (
                <TableHead className="w-12 px-2">
                  <span className="sr-only">{t('rubrics.criterion.remove')}</span>
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {criteria.map((criterion, index) =>
              isSelectionMode ? (
                <RubricCriterionSelectionRow
                  key={criterion.clientId}
                  criterion={criterion}
                  index={index}
                  selected={selectedSet.has(criterion.clientId)}
                  disabled={disabled}
                  onToggle={(event) => handleSelectionChange(criterion.clientId, event.target.checked)}
                />
              ) : (
                <RubricCriterionRow
                  key={criterion.clientId}
                  criterion={criterion}
                  index={index}
                  disabled={disabled}
                  autoFocus={focusClientId === criterion.clientId}
                  onChange={(patch) => onUpdate?.(criterion.clientId, patch)}
                  onRemove={() => onRemove?.(criterion.clientId)}
                />
              ),
            )}
          </TableBody>
        </Table>
      )}

      {validationMessage && isDirty ? (
        <p className="text-sm text-warning" role="alert">
          {validationMessage}
        </p>
      ) : null}
    </section>
  );
}
