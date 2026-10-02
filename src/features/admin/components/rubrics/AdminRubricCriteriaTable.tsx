import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import { CriterionLevelsEditor } from '@/features/employer-campaigns/components/wizard/criteria/CriterionLevelsEditor';
import type { RubricCriterion as EmployerRubricCriterion, RubricScoringScope } from '@/features/employer-campaigns/types/campaignManagement.types';
import type { RubricLevel } from '@/features/rubrics/types/rubric.types';
import type { AdminRubricCriterion } from '../../types/adminApi.types';

interface Props { criteria: AdminRubricCriterion[]; onChange: (next: AdminRubricCriterion[]) => void }
const inputClass = 'w-full rounded-lg border border-satin bg-surface-base px-3 py-2 text-sm text-foreground';

function toEditorCriterion(c: AdminRubricCriterion): EmployerRubricCriterion {
  return { id: c.id, name: c.name, weight: c.weight, description: c.description ?? '', maxScore: 5, levels: c.levels, scoringScope: c.scoringScope as RubricScoringScope };
}

export function AdminRubricCriteriaTable({ criteria, onChange }: Props) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameDraft, setNameDraft] = useState<{ id: string; value: string } | null>(null);
  const [pendingRename, setPendingRename] = useState<{ id: string; value: string } | null>(null);
  const editing = criteria.find((criterion) => criterion.id === editingId) ?? null;
  const patch = (id: string, changes: Partial<AdminRubricCriterion>) => onChange(criteria.map((c) => c.id === id ? { ...c, ...changes } : c));
  const add = () => {
    const id = `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    onChange([...criteria, { id, isNew: true, name: '', description: '', weight: 0, maxScore: 5, scoringScope: 'Always', scoringMethod: 'Ai', levels: [] }]);
  };

  return (
    <section className="space-y-3" aria-label={t('admin.rubrics.criteriaEditor')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('admin.rubrics.scaleLocked')}</p>
        <Button type="button" variant="secondary" onClick={add}>{t('admin.rubrics.addCriterion')}</Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-satin bg-surface-overlay/50">
        <table className="w-full min-w-[1040px] text-sm">
          <thead className="border-b border-satin bg-surface-overlay"><tr>
            <th className="p-3 text-left">{t('admin.rubrics.column.name')}</th>
            <th className="p-3 text-left">{t('admin.rubrics.column.description')}</th>
            <th className="w-28 p-3 text-left">{t('admin.rubrics.column.weight')}</th>
            <th className="w-48 p-3 text-left">{t('admin.rubrics.column.scope')}</th>
            <th className="w-24 p-3 text-left">{t('admin.rubrics.column.scale')}</th>
            <th className="p-3 text-left">{t('admin.rubrics.column.levels')}</th>
            <th className="p-3 text-left">{t('admin.rubrics.column.actions')}</th>
          </tr></thead>
          <tbody>{criteria.map((criterion, index) => {
            const isNew = criterion.isNew === true;
            const measured = criterion.scoringMethod === 'DeliveryMetrics';
            const enabled = criterion.enabled !== false;
            return <tr key={criterion.id} className="border-b border-subtle align-top">
              <td className="min-w-56 p-3">
                <input className={inputClass} aria-label={`${t('admin.rubrics.column.name')} ${index + 1}`} value={nameDraft?.id === criterion.id ? nameDraft.value : criterion.name} disabled={measured && !isNew}
                  onChange={(event) => setNameDraft({ id: criterion.id, value: event.target.value })}
                  onBlur={() => {
                    if (nameDraft?.id !== criterion.id) return;
                    if (nameDraft.value.trim() !== criterion.name && !isNew) setPendingRename(nameDraft);
                    else { if (nameDraft.value.trim() !== criterion.name) patch(criterion.id, { name: nameDraft.value.trim() }); setNameDraft(null); }
                  }}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur(); } }} />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {measured ? <span className="rounded-full border border-satin px-2 py-0.5 text-xs">🎙 {t('admin.rubrics.measured.badge')}</span> : null}
                </div>
              </td>
              <td className="min-w-64 p-2"><Textarea aria-label={`${t('admin.rubrics.column.description')} ${index + 1}`} value={criterion.description ?? ''} rows={2} onChange={(event) => patch(criterion.id, { description: event.target.value })} /></td>
              <td className="p-3"><div className="flex items-center gap-1"><input className={inputClass} type="number" min="0" max="100" step="0.1" aria-label={`${t('admin.rubrics.column.weight')} ${index + 1}`} value={Math.round(criterion.weight * 1000) / 10} onChange={(event) => patch(criterion.id, { weight: Number(event.target.value) / 100 })} /><span>%</span></div></td>
              <td className="p-3"><select className={inputClass} aria-label={`${t('admin.rubrics.column.scope')} ${index + 1}`} value={criterion.scoringScope} disabled={measured && !isNew} onChange={(event) => patch(criterion.id, { scoringScope: event.target.value })}>
                <option value="Always">{t('admin.rubrics.scope.Always')}</option><option value="WhenTargeted">{t('admin.rubrics.scope.WhenTargeted')}</option>
              </select></td>
              <td className="p-3"><span className="inline-flex items-center gap-1 rounded-lg border border-satin px-2 py-1">🔒 0–5</span></td>
              <td className="min-w-52 p-3">
                {criterion.levels.length ? <ol className="mb-2 space-y-1 text-xs text-muted-foreground">
                  {criterion.levels.map((level) => <li key={level.score} className="line-clamp-2"><span className="mr-1 font-medium text-foreground">{level.score}:</span>{level.descriptor}</li>)}
                </ol> : <p className="mb-2 text-xs text-muted-foreground">{measured ? t('admin.rubrics.measured.noLevelsNeeded') : t('admin.rubrics.levels.none')}</p>}
                <Button type="button" variant="outline" size="sm" onClick={() => setEditingId(criterion.id)} aria-label={`${t('admin.rubrics.levels.edit')} ${index + 1}`}>{t(criterion.levels.length ? 'admin.rubrics.levels.edit' : 'admin.rubrics.levels.add')}</Button>
              </td>
              <td className="p-3"><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={enabled} aria-label={`${t('admin.rubrics.toggle')} ${index + 1}`} onChange={(event) => patch(criterion.id, { enabled: event.target.checked })} />{t('admin.rubrics.toggle')}</label>
                {!measured ? <Button type="button" variant="ghost" size="sm" className="mt-2 text-error" onClick={() => onChange(criteria.filter((item) => item.id !== criterion.id))}>{t('admin.rubrics.removeCriterion')}</Button> : null}
              </td>
            </tr>;
          })}</tbody>
        </table>
      </div>
      {editing ? <CriterionLevelsEditor open criterion={toEditorCriterion(editing)} indexLabel={String(criteria.findIndex((c) => c.id === editing.id) + 1)} onSave={(levels: RubricLevel[]) => patch(editing.id, { levels })} onClose={() => setEditingId(null)} /> : null}
      <ConfirmDialog open={Boolean(pendingRename)} onOpenChange={(open) => { if (!open) { setPendingRename(null); setNameDraft(null); } }}
        title={t('admin.rubrics.renameTitle')} description={t('admin.rubrics.renameDescription')} confirmLabel={t('admin.rubrics.renameConfirm')} cancelLabel={t('admin.rubrics.cancel')}
        onConfirm={() => { if (pendingRename) patch(pendingRename.id, { name: pendingRename.value.trim() }); setNameDraft(null); setPendingRename(null); }} />
    </section>
  );
}
