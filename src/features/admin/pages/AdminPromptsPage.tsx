import { useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import { AdminPageShell } from '../components/AdminPageShell';
import { PromptEditorPanel } from '../components/prompts/PromptEditorPanel';
import { PromptHistoryList } from '../components/prompts/PromptHistoryList';
import { useAdminPrompts } from '../hooks/useAdminPrompts';

const groupOrder = ['seniority', 'category', 'questions', 'criteria', 'criterion_levels', 'scoring', 'other'];
const promptGroup = (key: string) => key.startsWith('seniority.') ? 'seniority' : key.startsWith('category.') ? 'category' : key.startsWith('questions.') ? 'questions' : key.startsWith('criteria.') ? 'criteria' : key.startsWith('criterion_levels.') ? 'criterion_levels' : key.startsWith('scoring.') ? 'scoring' : 'other';

export function AdminPromptsPage() {
  const { t } = useLanguage();
  const [selectedKey, setSelectedKey] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const query = useAdminPrompts(selectedKey);
  const prompts = useMemo(() => [...(query.list.data ?? [])].sort((a, b) => groupOrder.indexOf(promptGroup(a.key)) - groupOrder.indexOf(promptGroup(b.key)) || a.key.localeCompare(b.key)), [query.list.data]);
  const selected = prompts.find((item) => item.key === selectedKey) ?? prompts[0];
  const forbidden = getApiStatusCode(query.list.error) === 403;
  const selectPrompt = (key: string) => setSelectedKey(key);
  const error = query.list.error;
  return <AdminPageShell eyebrow="SCR-ADM-PROMPTS" title={t('admin.prompts.title')} description={t('admin.prompts.description')}>
    {query.list.isLoading ? <div aria-live="polite" className="rounded-xl border border-satin bg-surface-raised p-6 text-sm text-muted-foreground">{t('admin.prompts.loading')}</div> : null}
    {query.list.isError ? <div className="space-y-3"><Alert variant="error"><AlertDescription>{forbidden ? t('admin.prompts.forbidden') : getApiErrorMessage(error, t('admin.prompts.error'))}</AlertDescription></Alert>{!forbidden ? <Button type="button" variant="outline" onClick={() => void query.list.refetch()}>{t('admin.prompts.retry')}</Button> : null}</div> : null}
    {query.list.data && query.list.data.length === 0 ? <EmptyState title={t('admin.prompts.emptyTitle')} description={t('admin.prompts.emptyDescription')} /> : null}
    {prompts.length > 0 ? <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]"><aside className="space-y-3 rounded-xl border border-satin bg-surface-raised p-3"><p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('admin.prompts.keys')}</p>{groupOrder.map((group) => { const items = prompts.filter((item) => promptGroup(item.key) === group); return items.length ? <section key={group}><h2 className="px-2 py-2 text-xs uppercase text-muted-foreground">{t(`admin.prompts.group.${group}`)}</h2>{items.map((item) => <button type="button" key={item.key} onClick={() => selectPrompt(item.key)} className={`w-full rounded-lg px-2 py-2 text-left text-xs transition ${selected?.key === item.key ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground'}`}>{item.key}</button>)}</section> : null; })}</aside><div className="space-y-6">{selected ? <><PromptEditorPanel prompt={selected} saving={query.update.isPending || query.reset.isPending} onSave={(body, changeNote) => query.update.mutate({ key: selected.key, body, changeNote })} onReset={() => setResetOpen(true)} /><PromptHistoryList items={query.history.data ?? []} loading={query.history.isLoading} /></> : null}</div></div> : null}
    <Dialog open={resetOpen} onOpenChange={setResetOpen}><DialogContent><DialogHeader><DialogTitle>{t('admin.prompts.resetTitle')}</DialogTitle><DialogDescription>{t('admin.prompts.resetDescription')}</DialogDescription></DialogHeader><DialogFooter><Button type="button" variant="outline" onClick={() => setResetOpen(false)}>{t('admin.prompts.cancel')}</Button><Button type="button" variant="destructive" loading={query.reset.isPending} onClick={() => { if (selected) query.reset.mutate(selected.key, { onSuccess: () => setResetOpen(false) }); }}>{t('admin.prompts.resetConfirm')}</Button></DialogFooter></DialogContent></Dialog>
  </AdminPageShell>;
}
