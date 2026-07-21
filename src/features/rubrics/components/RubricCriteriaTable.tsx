import { Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import type { EditableRubricCriterion } from '../types/rubric.types';
import { RubricCriterionRow } from './RubricCriterionRow';

interface RubricCriteriaTableProps {
  criteria: EditableRubricCriterion[];
  disabled?: boolean;
  focusClientId: string | null;
  validationMessage?: string | null;
  isDirty: boolean;
  canSave: boolean;
  isSaving: boolean;
  onAdd: () => void;
  onSave: () => void;
  onUpdate: (clientId: string, patch: Partial<EditableRubricCriterion>) => void;
  onRemove: (clientId: string) => void;
}

export function RubricCriteriaTable({
  criteria,
  disabled = false,
  focusClientId,
  validationMessage,
  isDirty,
  canSave,
  isSaving,
  onAdd,
  onSave,
  onUpdate,
  onRemove,
}: RubricCriteriaTableProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="heading-secondary text-lg text-foreground">{t('rubrics.list.title')}</h3>
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
      </div>

      {criteria.length === 0 ? (
        <EmptyState
          title={t('rubrics.empty.title')}
          description=""
          action={
            <Button type="button" variant="secondary" onClick={onAdd} disabled={disabled}>
              {t('rubrics.empty.action')}
            </Button>
          }
        />
      ) : (
        <div className="frame-satin overflow-hidden rounded-xl border border-satin bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-[color:var(--satin-border)] bg-surface-overlay/60 text-caption text-muted-foreground">
                  <th className="w-8 px-2 py-3" aria-hidden />
                  <th className="w-10 px-2 py-3">#</th>
                  <th className="px-2 py-3 font-medium">{t('rubrics.criterion.name')}</th>
                  <th className="px-2 py-3 font-medium">{t('rubrics.criterion.description')}</th>
                  <th className="w-28 px-2 py-3 font-medium">{t('rubrics.criterion.weight')}</th>
                  <th className="w-24 px-2 py-3 font-medium">{t('rubrics.criterion.maxScore')}</th>
                  <th className="w-12 px-2 py-3">
                    <span className="sr-only">{t('rubrics.criterion.remove')}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--satin-border)]">
                {criteria.map((criterion, index) => (
                  <RubricCriterionRow
                    key={criterion.clientId}
                    criterion={criterion}
                    index={index}
                    disabled={disabled}
                    autoFocus={focusClientId === criterion.clientId}
                    onChange={(patch) => onUpdate(criterion.clientId, patch)}
                    onRemove={() => onRemove(criterion.clientId)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {validationMessage && isDirty ? (
        <p className="text-sm text-warning" role="alert">
          {validationMessage}
        </p>
      ) : null}
    </section>
  );
}
