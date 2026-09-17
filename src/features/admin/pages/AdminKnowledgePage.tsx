import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AppPagination } from '@/components/ui/app-pagination';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { EmptyState } from '@/components/patterns/EmptyState';
import { getApiStatusCode } from '@/shared/api/apiError';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { SELECT_CLASS } from '../components/common/OrgPicker';
import { Context7IngestDialog } from '../components/knowledge/Context7IngestDialog';
import { KnowledgeAddDialog } from '../components/knowledge/KnowledgeAddDialog';
import { KnowledgeTable } from '../components/knowledge/KnowledgeTable';
import { useAdminKnowledgeActions, useAdminKnowledgeList } from '../hooks/useAdminKnowledge';
import { useDirectoryCursor } from '../hooks/useDirectoryCursor';
import type { KnowledgeSource } from '../types/adminApi.types';
import { KNOWLEDGE_CATEGORIES, knowledgeErrorMessage } from '../utils/adminKnowledge';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;
type Dialog = { kind: 'add' } | { kind: 'c7' } | { kind: 'reindex'; item: KnowledgeSource } | { kind: 'delete'; item: KnowledgeSource } | null;

/**
 * Kho tri thức (RAG, D27): tài liệu uy tín admin curate để AI SINH câu hỏi/bài giảng có trích nguồn.
 * Không ảnh hưởng chấm điểm (`build_scoring_prompt` không nhận grounding). Trước đợt D: 6 endpoint có,
 * service FE có, 0 màn — 08-08 nạp 25 nguồn, 09-15 lên 45 nguồn đều qua API.
 */
export function AdminKnowledgePage() {
  const { t } = useLanguage();
  const [category, setCategory] = useState('');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const pagination = useDirectoryCursor();
  const list = useAdminKnowledgeList({ ...(category ? { jobCategory: category } : {}), ...(pagination.currentCursor ? { cursor: pagination.currentCursor } : {}), limit: pagination.pageSize });
  const { create, remove, reindex, search, ingest } = useAdminKnowledgeActions();
  const nextCursor = list.data?.nextCursor ?? null;
  const status = getApiStatusCode(list.error);
  const busyId = reindex.isPending ? (reindex.variables ?? null) : remove.isPending ? (remove.variables ?? null) : null;
  const close = () => { setDialog(null); setLastError(null); create.reset(); ingest.reset(); search.reset(); };
  const fail = (error: unknown) => setLastError(knowledgeErrorMessage(error, t));

  return (
    <AdminPageShell title={t('admin.knowledge.title')} description={t('admin.knowledge.description')} actions={(
      <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setDialog({ kind: 'c7' })}>{t('admin.knowledge.c7.open')}</Button><Button type="button" onClick={() => setDialog({ kind: 'add' })}>{t('admin.knowledge.add.open')}</Button></div>
    )}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5"><Label htmlFor="kn-filter-category">{t('admin.knowledge.filter.category')}</Label>
          <select id="kn-filter-category" className={SELECT_CLASS} value={category} onChange={(event) => { setCategory(event.target.value); pagination.reset(); }}>
            <option value="">{t('admin.knowledge.filter.all')}</option>{KNOWLEDGE_CATEGORIES.map((c) => <option key={c} value={c}>{t(`admin.knowledge.category.${c}`)}</option>)}
          </select></div>
        {list.data ? <p className="text-sm text-muted-foreground">{t('admin.directory.pageCount').replace('{count}', String(list.data.items.length))}</p> : null}
      </div>
      {lastError && dialog === null ? <Alert variant="error"><AlertDescription>{lastError}</AlertDescription></Alert> : null}
      {list.isLoading ? <div aria-label={t('admin.directory.loading')} className="h-72 animate-pulse rounded-xl border border-satin bg-surface-raised" /> : null}
      {list.isError ? <Alert variant="error"><AlertDescription>{t(status === 401 ? 'admin.directory.errors.unauthorized' : status === 403 ? 'admin.directory.errors.forbidden' : 'admin.knowledge.error.list')}</AlertDescription></Alert> : null}
      {list.data && !list.isError ? (
        list.data.items.length === 0 ? <EmptyState variant="no-results" title={t('admin.knowledge.empty')} description={t('admin.knowledge.emptyDescription')} /> : (
          <div className="space-y-4">
            <div className="overflow-x-auto"><KnowledgeTable items={list.data.items} busyId={busyId} onReindex={(item) => setDialog({ kind: 'reindex', item })} onDelete={(item) => setDialog({ kind: 'delete', item })} /></div>
            <AppPagination mode="cursor" currentPage={pagination.pageNumber} pageSize={pagination.pageSize} pageSizeOptions={PAGE_SIZE_OPTIONS} itemCount={list.data.items.length} itemLabel={t('admin.knowledge.itemLabel')} hasPreviousPage={pagination.hasPreviousPage} hasNextPage={Boolean(nextCursor)} isLoading={list.isFetching} onPageSizeChange={pagination.changePageSize} onPreviousPage={pagination.previous} onNextPage={() => pagination.next(nextCursor)} />
          </div>
        )
      ) : null}

      <KnowledgeAddDialog open={dialog?.kind === 'add'} loading={create.isPending} errorMessage={dialog?.kind === 'add' ? lastError : null} onClose={close} onSubmit={(input) => create.mutate(input, { onSuccess: close, onError: fail })} />
      <Context7IngestDialog open={dialog?.kind === 'c7'} searching={search.isPending} ingesting={ingest.isPending} results={search.data ?? null} errorMessage={dialog?.kind === 'c7' ? lastError : null}
        onSearch={(libraryName) => { setLastError(null); search.mutate({ libraryName }, { onError: fail }); }} onIngest={(input) => ingest.mutate(input, { onSuccess: close, onError: fail })} onClose={close} />
      <ConfirmDialog open={dialog?.kind === 'reindex'} onOpenChange={(open) => { if (!open) close(); }} title={t('admin.knowledge.reindexConfirm.title')} description={t('admin.knowledge.reindexConfirm.description').replace('{name}', dialog?.kind === 'reindex' ? dialog.item.title : '')} confirmLabel={t('admin.knowledge.reindex')} cancelLabel={t('admin.rubrics.cancel')} loading={reindex.isPending}
        onConfirm={() => { if (dialog?.kind === 'reindex') reindex.mutate(dialog.item.id, { onSuccess: close, onError: (error) => { close(); fail(error); } }); }} />
      <ConfirmDialog open={dialog?.kind === 'delete'} onOpenChange={(open) => { if (!open) close(); }} title={t('admin.knowledge.deleteConfirm.title')} description={t('admin.knowledge.deleteConfirm.description').replace('{name}', dialog?.kind === 'delete' ? dialog.item.title : '')} confirmLabel={t('admin.knowledge.delete')} cancelLabel={t('admin.rubrics.cancel')} destructive loading={remove.isPending}
        onConfirm={() => { if (dialog?.kind === 'delete') remove.mutate(dialog.item.id, { onSuccess: close, onError: (error) => { close(); fail(error); } }); }} />
    </AdminPageShell>
  );
}
