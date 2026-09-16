import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import type { PromptTemplate } from '../../types/adminApi.types';

/** `updatedBy` là Guid người sửa (BE chưa snapshot email — đợt B). Không in Guid thô ra mặt admin; giữ trong `title` để tra. */
export function PromptHistoryList({ items, loading }: { items: PromptTemplate[]; loading: boolean }) {
  const { t, language } = useLanguage();
  const when = (iso: string | null | undefined) => {
    if (!iso) return '—';
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? iso : date.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };
  return (
    <Card className="frame-satin">
      <CardHeader><CardTitle className="text-base">{t('admin.prompts.history')}</CardTitle></CardHeader>
      <CardContent>
        {loading ? <p className="text-sm text-muted-foreground">{t('admin.prompts.loading')}</p> : items.length === 0 ? <p className="text-sm text-muted-foreground">{t('admin.prompts.historyEmpty')}</p> : (
          <ol className="space-y-3">
            {items.map((item) => (
              <li key={`${item.key}-${item.version}`} className="rounded-lg border border-subtle bg-surface-overlay/60 p-3">
                <div className="flex justify-between gap-3 text-sm">
                  <span title={item.updatedBy ?? undefined}>{item.updatedBy ? t('admin.prompts.adminActor') : t('admin.prompts.system')}</span>
                  <span className="text-muted-foreground">v{item.version} · {when(item.createdAt)}</span>
                </div>
                {item.changeNote ? <p className="mt-1 text-sm text-muted-foreground">{item.changeNote}</p> : null}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
