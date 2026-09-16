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
          <aside className="space-y-3 rounded-xl border border-satin bg-surface-raised p-3 xl:sticky xl:top-6 xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto">
            {PROMPT_GROUP_ORDER.map((group) => {
              const items = prompts.filter(({ info }) => info.group === group);
              if (!items.length) return null;
              return (
                <section key={group}>
                  <h2 className="px-2 py-2 text-xs uppercase text-muted-foreground">{t(`admin.prompts.group.${group}`)}</h2>
                  {items.map(({ item, info }) => {
                    const active = selected?.item.key === item.key;
                    return (
                      <button
                        type="button"
                        key={item.key}
                        onClick={() => setSelectedKey(item.key)}
                        aria-pressed={active}
                        className={`w-full rounded-lg px-2 py-2 text-left text-sm transition ${active ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'}`}
                      >
                        <span className="block">{formatPromptLabel(t, info)}</span>
                        <span className="block text-[11px] text-muted-foreground">
                          {item.body === null ? t('admin.prompts.defaultBadge') : t('admin.prompts.customBadge')}
                          {info.risk === 'scoring' ? ` · ${t('admin.prompts.risk.scoring')}` : ''}
                        </span>
                      </button>
                    );
                  })}
                </section>
              );
            })}
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
