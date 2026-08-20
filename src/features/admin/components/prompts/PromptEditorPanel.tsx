import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { PromptTemplate } from '../../types/adminApi.types';

export function PromptEditorPanel({ prompt, saving, onSave, onReset }: { prompt: PromptTemplate; saving: boolean; onSave: (body: string, note: string) => void; onReset: () => void }) {
  const { t } = useLanguage();
  const [body, setBody] = useState(prompt.body ?? '');
  const [note, setNote] = useState('');
  useEffect(() => { setBody(prompt.body ?? ''); setNote(''); }, [prompt.key, prompt.body]);
  const isDefault = prompt.body === null;
  return (
    <Card className="frame-satin">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div><CardTitle className="text-base font-mono">{prompt.key}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{t('admin.prompts.version')} {prompt.version}</p></div>
        <Badge variant="outline">{isDefault ? t('admin.prompts.defaultBadge') : t('admin.prompts.customBadge')}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2"><Label htmlFor="prompt-body">{t('admin.prompts.body')}</Label><textarea id="prompt-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder={isDefault ? t('admin.prompts.defaultPlaceholder') : undefined} className="min-h-64 w-full rounded-xl border border-satin bg-surface-overlay/80 p-3 text-sm text-foreground outline-none focus:border-[var(--border-focus)] focus:ring-3 focus:ring-white/15" /></div>
        <div className="space-y-2"><Label htmlFor="prompt-note">{t('admin.prompts.changeNote')} *</Label><Input id="prompt-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('admin.prompts.changeNotePlaceholder')} /></div>
        <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" onClick={onReset} disabled={saving}>{t('admin.prompts.reset')}</Button><Button type="button" onClick={() => onSave(body, note.trim())} disabled={saving || !body.trim() || !note.trim()} loading={saving}>{t('admin.prompts.save')}</Button></div>
      </CardContent>
    </Card>
  );
}
