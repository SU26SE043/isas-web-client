import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { PromptTemplate } from '../../types/adminApi.types';
import { formatPromptLabel, type PromptKeyInfo } from '../../utils/adminPromptCatalog';

/** Trần BE (`PromptTemplateService`): body > 8000 ký tự ⇒ 400. Đếm ở đây để admin thấy trước. */
const BODY_MAX = 8000;

interface PromptEditorPanelProps {
  prompt: PromptTemplate;
  info: PromptKeyInfo;
  saving: boolean;
  onSave: (body: string, note: string) => void;
  onReset: () => void;
}

/**
 * Editor một khe prompt. Nói ba điều trước khi cho gõ: khe này THAY hay THÊM vào lời nhắc, nó ảnh
 * hưởng điểm số hay chỉ câu hỏi, và hiệu lực khi nào (≤60s, không deploy). Bản mặc định trong code
 * Python chưa hiện được ở đây (cần BE trả `defaultBody` — đợt B); tới lúc đó hộp nói rõ điều đó
 * thay vì để trống câm.
 */
export function PromptEditorPanel({ prompt, info, saving, onSave, onReset }: PromptEditorPanelProps) {
  const { t } = useLanguage();
  const [body, setBody] = useState(prompt.body ?? '');
  const [note, setNote] = useState('');
  useEffect(() => { setBody(prompt.body ?? ''); setNote(''); }, [prompt.key, prompt.body]);
  const isDefault = prompt.body === null;
  const tooLong = body.length > BODY_MAX;
  return (
    <Card className="frame-satin">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div className="min-w-0">
          <CardTitle className="text-base">{formatPromptLabel(t, info)}</CardTitle>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{prompt.key} · {t('admin.prompts.version')} {prompt.version}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{t(info.kind === 'replace' ? 'admin.prompts.kind.replace' : 'admin.prompts.kind.append')}</Badge>
            <Badge variant={info.risk === 'scoring' ? 'warning' : 'outline'}>{t(info.risk === 'scoring' ? 'admin.prompts.risk.scoring' : 'admin.prompts.risk.generation')}</Badge>
            <Badge variant={isDefault ? 'outline' : 'info'}>{isDefault ? t('admin.prompts.defaultBadge') : t('admin.prompts.customBadge')}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t(info.kind === 'replace' ? 'admin.prompts.kindHint.replace' : 'admin.prompts.kindHint.append')} {t('admin.prompts.effectHint')}</p>
        {info.risk === 'scoring' ? <Alert variant="warning"><AlertDescription>{t('admin.prompts.riskHint.scoring')}</AlertDescription></Alert> : null}
        {isDefault ? <Alert variant="info"><AlertDescription>{t(info.kind === 'replace' ? 'admin.prompts.defaultHidden.replace' : 'admin.prompts.defaultHidden.append')}</AlertDescription></Alert> : null}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prompt-body">{t('admin.prompts.body')}</Label>
            <span className={`text-xs ${tooLong ? 'text-error' : 'text-muted-foreground'}`}>{body.length}/{BODY_MAX}</span>
          </div>
          <textarea id="prompt-body" value={body} onChange={(event) => setBody(event.target.value)} placeholder={isDefault ? t('admin.prompts.defaultPlaceholder') : undefined} className="min-h-64 w-full rounded-xl border border-satin bg-surface-overlay/80 p-3 text-sm text-foreground outline-none focus:border-[var(--border-focus)] focus:ring-3 focus:ring-white/15" />
        </div>
        <div className="space-y-2"><Label htmlFor="prompt-note">{t('admin.prompts.changeNote')} *</Label><Input id="prompt-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('admin.prompts.changeNotePlaceholder')} /></div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onReset} disabled={saving || isDefault}>{t('admin.prompts.reset')}</Button>
          <Button type="button" onClick={() => onSave(body, note.trim())} disabled={saving || !body.trim() || !note.trim() || tooLong} loading={saving}>{t('admin.prompts.save')}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
