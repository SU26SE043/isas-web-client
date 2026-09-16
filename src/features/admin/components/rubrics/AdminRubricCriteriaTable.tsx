import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';
import { useLanguage } from '@/shared/languages';
import { CriterionLevelsEditor } from '@/features/employer-campaigns/components/wizard/criteria/CriterionLevelsEditor';
import type { RubricCriterion as EmployerRubricCriterion, RubricScoringScope } from '@/features/employer-campaigns/types/campaignManagement.types';
import type { RubricLevel } from '@/features/rubrics/types/rubric.types';
import type { AdminRubricCriterion } from '../../types/adminApi.types';

interface AdminRubricCriteriaTableProps {
  criteria: AdminRubricCriterion[];
  onChange: (next: AdminRubricCriterion[]) => void;
}

/** Bộ sửa mốc của employer nhận shape campaign — chỉ khác `description` không nullable. */
function toEditorCriterion(c: AdminRubricCriterion): EmployerRubricCriterion {
  return { id: c.id, name: c.name, weight: c.weight, description: c.description ?? '', maxScore: c.maxScore, levels: c.levels, scoringScope: c.scoringScope as RubricScoringScope };
}

/**
 * Bảng tiêu chí của MỘT (nghề, ngôn ngữ). Cột mốc là mốc THẬT của tiêu chí (2–10, CAMP-17) — không
 * phải 6 ô cứng 0..5 như bản cũ (gõ vào ô mà mốc chưa tồn tại thì bị nuốt im lặng).
 *
 * Bốn trường tên · trọng số · thang · phạm vi CHỈ HIỂN THỊ: BE khoá bằng cấu trúc DTO (đổi tên là
 * cắt đôi lịch sử điểm của mọi người dùng — BC12/BC15/F14). Tooltip nói lý do thay vì để admin
 * tìm ô nhập không có.
 */
export function AdminRubricCriteriaTable({ criteria, onChange }: AdminRubricCriteriaTableProps) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = criteria.find((c) => c.id === editingId) ?? null;

  const patch = (id: string, changes: Partial<AdminRubricCriterion>) =>
    onChange(criteria.map((c) => (c.id === id ? { ...c, ...changes } : c)));

  return (
    <div className="overflow-x-auto rounded-xl border border-satin bg-surface-overlay/50">
      <table className="w-full min-w-[880px] text-sm">
        <thead className="border-b border-white/10 bg-white/[0.04]">
          <tr>
            {(['name', 'weightMax', 'description', 'levels'] as const).map((column) => (
              <th key={column} className="p-3 text-left text-xs uppercase text-foreground">{t(`admin.rubrics.column.${column}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {criteria.map((c, index) => (
            <tr key={c.id} className="border-b border-white/5 align-top">
              <th className="w-56 p-3 text-left font-medium text-foreground">
                <Tooltip content={t('admin.rubrics.lockedHint')}>
                  <span className="block">{c.name}</span>
                </Tooltip>
                <Badge variant={c.scoringScope === 'WhenTargeted' ? 'info' : 'outline'} className="mt-1">
                  {t(c.scoringScope === 'WhenTargeted' ? 'admin.rubrics.scope.WhenTargeted' : 'admin.rubrics.scope.Always')}
                </Badge>
              </th>
              <td className="w-32 p-3 text-muted-foreground">
                <Tooltip content={t('admin.rubrics.lockedHint')}>
                  <span>{t('admin.rubrics.weightMaxValue').replace('{weight}', String(Math.round(c.weight * 100))).replace('{max}', String(c.maxScore))}</span>
                </Tooltip>
              </td>
              <td className="p-2">
                <Textarea
                  aria-label={`${t('admin.rubrics.column.description')} ${c.name}`}
                  value={c.description ?? ''}
                  rows={3}
                  placeholder={t('admin.rubrics.descriptionPlaceholder')}
                  onChange={(event) => patch(c.id, { description: event.target.value })}
                  className="min-h-20 text-sm"
                />
              </td>
              <td className="w-72 p-3">
                {c.levels.length ? (
                  <ol className="space-y-1 text-xs text-muted-foreground" aria-label={`${t('admin.rubrics.column.levels')} ${c.name}`}>
                    {c.levels.map((level) => (
                      <li key={level.score} className="flex gap-2">
                        <span className="w-6 shrink-0 font-medium text-foreground">{level.score}</span>
                        <span className="line-clamp-2">{level.descriptor}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-xs text-warning">{t('admin.rubrics.levels.none')}</p>
                )}
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => setEditingId(c.id)} aria-label={`${t('admin.rubrics.levels.edit')} ${c.name}`}>
                  {t(c.levels.length ? 'admin.rubrics.levels.edit' : 'admin.rubrics.levels.add')}
                </Button>
                <span className="sr-only">{index + 1}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing ? (
        <CriterionLevelsEditor
          open
          criterion={toEditorCriterion(editing)}
          indexLabel={String(criteria.findIndex((c) => c.id === editing.id) + 1)}
          onSave={(levels: RubricLevel[]) => patch(editing.id, { levels })}
          onClose={() => setEditingId(null)}
        />
      ) : null}
    </div>
  );
}
