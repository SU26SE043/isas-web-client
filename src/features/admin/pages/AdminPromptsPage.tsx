import { useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { PromptEditorPanel } from '../components/prompts/PromptEditorPanel';
import { PromptHistoryList } from '../components/prompts/PromptHistoryList';
import { useAdminPromptHistory, useAdminPrompts } from '../hooks/useAdminPrompts';
import { DEAD_PROMPT_KEYS, PROMPT_GROUP_ORDER, describePromptKey, formatPromptLabel } from '../utils/adminPromptCatalog';

/**
 * Hướng dẫn cho AI (F21). Sidebar nhóm theo LUỒNG với nhãn người đọc (khoá máy hiện phụ), 5 khoá
 * chết bị ẩn (`DEAD_PROMPT_KEYS`). Lịch sử tải theo khoá ĐANG CHỌN — bản cũ dùng `selectedKey`
 * khởi tạo '' nên khoá đầu tự chọn không bao giờ tải lịch sử. Sidebar 35 mảnh cao ~2300px nên phải
 * DÍNH + tự cuộn trong khung: không thì bấm mảnh ở cuối là trang cuộn theo nút, ô sửa (đứng đầu cột
 * phải) trôi mất khỏi màn hình — admin bấm xong không thấy gì đổi (đo bằng ảnh L3 2026-09-16).
 */
export function AdminPromptsPage() {
  const { t } = useLanguage();
  const [selectedKey, setSelectedKey] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const query = useAdminPrompts();
  const prompts = useMemo(
    () => [...(query.list.data ?? [])]
      .filter((item) => !DEAD_PROMPT_KEYS.has(item.key))
      .map((item) => ({ item, info: describePromptKey(item.key) }))
      .sort((a, b) => PROMPT_GROUP_ORDER.indexOf(a.info.group) - PROMPT_GROUP_ORDER.indexOf(b.info.group) || a.item.key.localeCompare(b.item.key)),
    [query.list.data],
  );
  const selected = prompts.find(({ item }) => item.key === selectedKey) ?? prompts[0];
  const groups = PROMPT_GROUP_ORDER
    .map((group) => ({ group, items: prompts.filter(({ info }) => info.group === group) }))
    .filter(({ items }) => items.length > 0);
  const history = useAdminPromptHistory(selected?.item.key);
  const forbidden = getApiStatusCode(query.list.error) === 403;
  const error = query.list.error;

  return (
    <AdminPageShell title={t('admin.prompts.title')} description={t('admin.prompts.description')}>
      {query.list.isLoading ? <div aria-live="polite" className="rounded-xl border border-satin bg-surface-raised p-6 text-sm text-muted-foreground">{t('admin.prompts.loading')}</div> : null}
      {query.list.isError ? (
        <div className="space-y-3">
          <Alert variant="error"><AlertDescription>{forbidden ? t('admin.prompts.forbidden') : getApiErrorMessage(error, t('admin.prompts.error'))}</AlertDescription></Alert>
          {!forbidden ? <Button type="button" variant="outline" onClick={() => void query.list.refetch()}>{t('admin.prompts.retry')}</Button> : null}
        </div>
      ) : null}
      {query.list.data && query.list.data.length === 0 ? <EmptyState title={t('admin.prompts.emptyTitle')} description={t('admin.prompts.emptyDescription')} /> : null}

      {prompts.length > 0 ? (
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="rounded-xl border border-satin bg-surface-raised p-2 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto">
            {groups.map(({ group, items }, index) => (
              <section key={group} className={index > 0 ? 'mt-3 border-t border-satin pt-3' : undefined}>
                {/* Tên nhóm phải ĐỨNG RA khỏi 35 dòng mục: đậm, giãn chữ, màu chữ chính, kèm số mảnh —
                    bản trước là xám nhạt cỡ xs, chìm hẳn (user: "category rõ ràng ra, in đậm tí"). */}
                <h2 className="mb-1 flex items-center justify-between gap-2 px-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{t(`admin.prompts.group.${group}`)}</span>
                  <span className="rounded-full bg-surface-overlay px-1.5 text-[11px] tabular-nums text-muted-foreground">{items.length}</span>
                </h2>
                {items.map(({ item, info }) => {
                  const active = selected?.item.key === item.key;
                  const custom = item.body !== null;
                  const scoring = info.risk === 'scoring';
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setSelectedKey(item.key)}
                      aria-pressed={active}
                      className={`w-full rounded-lg border-l-2 px-2 py-1.5 text-left text-sm transition ${active ? 'border-info bg-surface-overlay font-medium text-foreground' : 'border-transparent text-muted-foreground hover:bg-surface-overlay/60 hover:text-foreground'}`}
                    >
                      <span className="block">{formatPromptLabel(t, info)}</span>
                      {/* Dòng phụ CHỈ khi có gì khác thường — "Đang dùng bản mặc định" lặp 35 lần là nhiễu. */}
                      {custom || scoring ? (
                        <span className="mt-0.5 flex flex-wrap gap-x-2 text-[11px]">
                          {custom ? <span className="text-info">{t('admin.prompts.customBadge')} · v{item.version}</span> : null}
                          {scoring ? <span className="text-warning">{t('admin.prompts.risk.scoring')}</span> : null}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </section>
            ))}
          </aside>
          <div className="space-y-6">
            {selected ? (
              <>
                <PromptEditorPanel
                  prompt={selected.item}
                  info={selected.info}
                  saving={query.update.isPending || query.reset.isPending}
                  onSave={(body, changeNote) => query.update.mutate({ key: selected.item.key, body, changeNote })}
                  onReset={() => setResetOpen(true)}
                />
                {query.update.isError ? <Alert variant="error"><AlertDescription>{getApiErrorMessage(query.update.error, t('admin.prompts.saveError'))}</AlertDescription></Alert> : null}
                <PromptHistoryList items={history.data ?? []} loading={history.isLoading} />
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title={t('admin.prompts.resetTitle')}
        description={t('admin.prompts.resetDescription')}
        confirmLabel={t('admin.prompts.resetConfirm')}
        cancelLabel={t('admin.prompts.cancel')}
        destructive
        loading={query.reset.isPending}
        onConfirm={() => { if (selected) query.reset.mutate(selected.item.key, { onSuccess: () => setResetOpen(false) }); }}
      />
    </AdminPageShell>
  );
}
