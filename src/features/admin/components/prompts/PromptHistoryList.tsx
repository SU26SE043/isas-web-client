import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { PromptTemplate } from '../../types/adminApi.types';

export function PromptHistoryList({ items, loading }: { items: PromptTemplate[]; loading: boolean }) {
  const { t } = useLanguage();
  return <Card className="frame-satin"><CardHeader><CardTitle className="text-base">{t('admin.prompts.history')}</CardTitle></CardHeader><CardContent>{loading ? <p className="text-sm text-muted-foreground">{t('admin.prompts.loading')}</p> : items.length === 0 ? <p className="text-sm text-muted-foreground">{t('admin.prompts.historyEmpty')}</p> : <ol className="space-y-3">{items.map((item) => <li key={`${item.key}-${item.version}`} className="rounded-lg border border-subtle bg-surface-overlay/60 p-3"><div className="flex justify-between gap-3 text-sm"><span>{item.updatedBy ?? t('admin.prompts.system')}</span><span className="text-muted-foreground">v{item.version} · {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</span></div>{item.changeNote ? <p className="mt-1 text-sm text-muted-foreground">{item.changeNote}</p> : null}</li>)}</ol>}</CardContent></Card>;
}
