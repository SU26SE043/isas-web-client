import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminRubricCriteriaTable } from '../components/rubrics/AdminRubricCriteriaTable';
import { AdminRubricPreviewPanel } from '../components/rubrics/AdminRubricPreviewPanel';
import { AdminRubricSuggestControls } from '../components/rubrics/AdminRubricSuggestControls';
import { RubricMatrixChips } from '../components/rubrics/RubricMatrixChips';
import { useAdminRubrics } from '../hooks/useAdminRubrics';
import type { AdminRubricCriterion, AdminRubricJobCategory, AdminRubricLanguage } from '../types/adminApi.types';
import { toAdminRubricUpsertInput } from '../utils/adminRubricApi';

/**
 * Thước đo chấm điểm — bộ chuẩn B2C do admin quản (BC-8). Ba việc màn này phải trả lời được như
 * `/admin/roadmap-thresholds`: (a) bộ nào đang chạy, còn thiếu ở đâu (ma trận); (b) mốc thật của
 * từng tiêu chí, sửa được, thêm/xoá được (CAMP-17); (c) sửa xong thì thấy gì — chấm thử ngay.
 *
 * Viết lại toàn bộ 2026-09-16: bản trước dùng hợp đồng tự bịa nên bảng luôn trống và PUT trả
 * 200 `changed:false` (không lưu gì). Xem `adminRubricApi.ts` cho luật parse-first.
 */
export function AdminRubricsPage() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<AdminRubricJobCategory>('BE');
  const [language, setLanguage] = useState<AdminRubricLanguage>('vi');
  const [draft, setDraft] = useState<AdminRubricCriterion[] | null>(null);
  const [confirm, setConfirm] = useState<'save' | 'reset' | 'discard' | null>(null);
  const [pendingSelect, setPendingSelect] = useState<{ category: AdminRubricJobCategory; language: AdminRubricLanguage } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const query = useAdminRubrics(category, language);
  const rubric = query.detail.data ?? null;

  // Đổi bộ hoặc server trả bản mới ⇒ bỏ nháp (không mang nháp của BE/vi sang FE/en).
  useEffect(() => { setDraft(null); }, [category, language, rubric?.version]);

  const criteria = draft ?? rubric?.criteria ?? [];
  const dirty = draft !== null && JSON.stringify(toAdminRubricUpsertInput(draft)) !== JSON.stringify(toAdminRubricUpsertInput(rubric?.criteria ?? []));
  const forbidden = getApiStatusCode(query.detail.error) === 403;
  const missingLevels = useMemo(() => criteria.filter((c) => c.levels.length === 0).length, [criteria]);

  // Đổi bộ khi còn nháp: hỏi bằng dialog của app (không `window.confirm` — treo trình tự động hoá, đã ghi ở CampaignSlotsPanel).
  const select = (nextCategory: AdminRubricJobCategory, nextLanguage: AdminRubricLanguage) => {
    if (dirty) { setPendingSelect({ category: nextCategory, language: nextLanguage }); setConfirm('discard'); return; }
    setCategory(nextCategory);
    setLanguage(nextLanguage);
  };
  const discardAndSelect = () => {
    if (pendingSelect) { setCategory(pendingSelect.category); setLanguage(pendingSelect.language); }
    setPendingSelect(null);
    setDraft(null);
    setConfirm(null);
  };
  const save = () =>
    query.update.mutate(toAdminRubricUpsertInput(criteria), {
      onSuccess: (saved) => {
        setConfirm(null);
        setDraft(null);
        setNotice(saved.changed ? t('admin.rubrics.saveSuccess').replace('{version}', String(saved.version)) : t('admin.rubrics.saveUnchanged'));
      },
    });
  const reset = () =>
    query.reset.mutate(undefined, {
      onSuccess: (saved) => { setConfirm(null); setDraft(null); setNotice(t('admin.rubrics.resetSuccess').replace('{version}', String(saved.version))); },
    });

  return (
    <AdminPageShell
      title={t('admin.rubrics.title')}
      description={t('admin.rubrics.description')}
      actions={
        <>
          <Button type="button" variant="outline" disabled={!rubric || query.reset.isPending} onClick={() => setConfirm('reset')}>{t('admin.rubrics.reset')}</Button>
          <Button type="button" disabled={!dirty} loading={query.update.isPending} onClick={() => setConfirm('save')}>{t('admin.rubrics.save')}</Button>
        </>
      }
    >
      <RubricMatrixChips rows={query.matrix.data} selected={{ category, language }} onSelect={select} />

      {query.detail.isLoading ? <p aria-live="polite" className="rounded-xl border border-satin bg-surface-raised p-6 text-sm text-muted-foreground">{t('admin.rubrics.loading')}</p> : null}
      {query.detail.isError ? (
        <div className="space-y-3">
          <Alert variant="error"><AlertDescription>{forbidden ? t('admin.rubrics.forbidden') : getApiErrorMessage(query.detail.error, t('admin.rubrics.error'))}</AlertDescription></Alert>
          {!forbidden ? <Button type="button" variant="outline" onClick={() => void query.detail.refetch()}>{t('admin.rubrics.retry')}</Button> : null}
        </div>
      ) : null}
      {notice ? <Alert variant="success"><AlertDescription>{notice}</AlertDescription></Alert> : null}
      {query.update.isError ? <Alert variant="error"><AlertDescription>{getApiErrorMessage(query.update.error, t('admin.rubrics.saveError'))}</AlertDescription></Alert> : null}
      {query.reset.isError ? <Alert variant="error"><AlertDescription>{getApiErrorMessage(query.reset.error, t('admin.rubrics.resetError'))}</AlertDescription></Alert> : null}

      {rubric ? (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{t('admin.rubrics.version').replace('{version}', String(rubric.version))}</Badge>
            <span>{t('admin.rubrics.criteriaSummary').replace('{count}', String(rubric.criteria.length)).replace('{missing}', String(missingLevels))}</span>
            {dirty ? <Badge variant="warning">{t('admin.rubrics.dirty')}</Badge> : null}
            {dirty ? <Button type="button" variant="ghost" size="sm" onClick={() => setDraft(null)}>{t('admin.rubrics.discard')}</Button> : null}
          </div>
          <Alert variant="info"><AlertDescription>{t('admin.rubrics.effectNote')}</AlertDescription></Alert>
          <AdminRubricSuggestControls criteria={criteria} suggest={query.suggest} onApply={setDraft} />
          <AdminRubricCriteriaTable criteria={criteria} onChange={setDraft} />
          <AdminRubricPreviewPanel rubric={rubric} hasUnsavedChanges={dirty} preview={query.preview} history={query.previewHistory} />
          <section className="rounded-xl border border-satin bg-surface-raised p-4" aria-label={t('admin.rubrics.history.title')}>
            <h2 className="text-base font-medium text-foreground">{t('admin.rubrics.history.title')}</h2>
            {query.history.data?.length ? (
              <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                {query.history.data.map((item) => (
                  <li key={item.version} className="flex flex-wrap items-center gap-2">
                    <span>{t('admin.rubrics.history.row').replace('{version}', String(item.version)).replace('{count}', String(item.criteriaCount)).replace('{with}', String(item.withLevelsCount))}</span>
                    {item.isActive ? <Badge variant="success">{t('admin.rubrics.history.active')}</Badge> : null}
                  </li>
                ))}
              </ol>
            ) : <p className="mt-2 text-sm text-muted-foreground">{t('admin.rubrics.history.empty')}</p>}
          </section>
        </>
      ) : null}

      <ConfirmDialog
        open={confirm === 'save'}
        onOpenChange={(open) => { if (!open) setConfirm(null); }}
        title={t('admin.rubrics.saveTitle').replace('{next}', String((rubric?.version ?? 0) + 1))}
        description={t('admin.rubrics.saveDescription')}
        confirmLabel={t('admin.rubrics.saveConfirm')}
        cancelLabel={t('admin.rubrics.cancel')}
        loading={query.update.isPending}
        onConfirm={save}
      />
      <ConfirmDialog
        open={confirm === 'discard'}
        onOpenChange={(open) => { if (!open) { setConfirm(null); setPendingSelect(null); } }}
        title={t('admin.rubrics.discardTitle')}
        description={t('admin.rubrics.discardConfirm')}
        confirmLabel={t('admin.rubrics.discard')}
        cancelLabel={t('admin.rubrics.cancel')}
        destructive
        onConfirm={discardAndSelect}
      />
      <ConfirmDialog
        open={confirm === 'reset'}
        onOpenChange={(open) => { if (!open) setConfirm(null); }}
        title={t('admin.rubrics.resetTitle')}
        description={t('admin.rubrics.resetDescription')}
        confirmLabel={t('admin.rubrics.resetConfirm')}
        cancelLabel={t('admin.rubrics.cancel')}
        destructive
        loading={query.reset.isPending}
        onConfirm={reset}
      />
    </AdminPageShell>
  );
}
