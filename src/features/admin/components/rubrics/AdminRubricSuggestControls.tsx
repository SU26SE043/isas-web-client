import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage } from '@/shared/api/apiError';
import type { AdminRubricCriterion, AdminSuggestLevelsResponse } from '../../types/adminApi.types';
import { mergeAdminSuggestedLevels, summarizeAdminSuggestion, type AdminSuggestMergeMode } from '../../utils/adminRubricApi';

interface AdminRubricSuggestControlsProps {
  criteria: AdminRubricCriterion[];
  suggest: UseMutationResult<AdminSuggestLevelsResponse, unknown, string | undefined>;
  onApply: (next: AdminRubricCriterion[]) => void;
}

const SENIORITIES = ['Fresher', 'Junior', 'Middle', 'Senior'] as const;
const SELECT_CLASS = 'h-9 rounded-lg border border-satin bg-surface-overlay px-3 text-sm text-foreground';

/**
 * "AI đề xuất mốc" — ghép theo `criterionId` vào bản nháp (KHÔNG ghi DB cho tới khi Lưu). Bản cũ
 * đổ nguyên response (`criteria[].criterionId`) vào chỗ chờ `criteria[].id` ⇒ bấm Lưu là BE 400
 * "tiêu chí 00000000-… không thuộc bộ chuẩn". Sau khi áp, nói RÕ tên tiêu chí bị chạm.
 */
export function AdminRubricSuggestControls({ criteria, suggest, onApply }: AdminRubricSuggestControlsProps) {
  const { t } = useLanguage();
  const [seniority, setSeniority] = useState('');
  const [mode, setMode] = useState<AdminSuggestMergeMode>('fillEmpty');
  const [applied, setApplied] = useState<string[] | null>(null);

  const run = () =>
    suggest.mutate(seniority || undefined, {
      onSuccess: (response) => {
        const summary = summarizeAdminSuggestion(criteria, response.criteria);
        const touched = mode === 'fillEmpty' ? summary.matchedEmptyNames : summary.matchedNames;
        onApply(mergeAdminSuggestedLevels(criteria, response.criteria, mode));
        setApplied(touched);
      },
    });

  return (
    <section className="space-y-3 rounded-xl border border-satin bg-surface-raised p-4" aria-label={t('admin.rubrics.suggest')}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="rubric-suggest-seniority">{t('admin.rubrics.suggest.seniority')}</Label>
          <select id="rubric-suggest-seniority" value={seniority} onChange={(event) => setSeniority(event.target.value)} className={SELECT_CLASS}>
            <option value="">{t('admin.rubrics.preview.seniorityAny')}</option>
            {SENIORITIES.map((level) => <option key={level} value={level}>{t(`admin.rubrics.seniority.${level}`)}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="rubric-suggest-mode">{t('admin.rubrics.suggest.mode')}</Label>
          <select id="rubric-suggest-mode" value={mode} onChange={(event) => setMode(event.target.value as AdminSuggestMergeMode)} className={SELECT_CLASS}>
            <option value="fillEmpty">{t('admin.rubrics.suggest.fillEmpty')}</option>
            <option value="replaceAll">{t('admin.rubrics.suggest.replaceAll')}</option>
          </select>
        </div>
        <Button type="button" variant="outline" loading={suggest.isPending} onClick={run}>{t('admin.rubrics.suggest')}</Button>
        <p className="text-xs text-muted-foreground">{t('admin.rubrics.suggest.hint')}</p>
      </div>
      {suggest.isError ? <Alert variant="error"><AlertDescription>{t('admin.rubrics.suggest.error')} {getApiErrorMessage(suggest.error, '')}</AlertDescription></Alert> : null}
      {applied !== null && !suggest.isPending ? (
        <Alert variant={applied.length ? 'info' : 'warning'}>
          <AlertDescription>
            {applied.length ? t('admin.rubrics.suggest.applied').replace('{names}', applied.join(', ')) : t('admin.rubrics.suggest.nothingApplied')}
          </AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
