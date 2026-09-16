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
const TEXTAREA = 'min-h-64 w-full rounded-xl border border-satin bg-surface-overlay/80 p-3 text-sm text-foreground outline-none focus:border-[var(--border-focus)] focus:ring-3 focus:ring-white/15';

interface PromptEditorPanelProps {
  prompt: PromptTemplate;
  info: PromptKeyInfo;
  saving: boolean;
  onSave: (body: string, note: string) => void;
  onReset: () => void;
}

/**
 * Editor một khe prompt, MỘT ô: ô đã đổ sẵn chữ ĐANG CHẠY — bản admin sửa nếu có, không thì bản
 * mặc định của hệ (`defaultBody`, kéo từ AIService) — admin sửa thẳng vào rồi Lưu. Không còn ô
 * trống câm, không còn hai cột phải nhìn qua nhìn lại. `defaultBody === null` = BE không lấy được
 * (AIService chưa cấu hình/không tới được) ⇒ nói thẳng, không giả vờ mặc định trống.
 * Lưu chỉ bật khi chữ THẬT SỰ khác bản đang chạy — bấm Lưu mà không đổi gì sẽ tạo một "bản tuỳ
 * chỉnh" y hệt mặc định, nhãn nói dối từ đó về sau.
 */
export function PromptEditorPanel({ prompt, info, saving, onSave, onReset }: PromptEditorPanelProps) {
  const { t } = useLanguage();
  const isDefault = prompt.body === null;
  const defaultBody = prompt.defaultBody;
  const defaultKnown = typeof defaultBody === 'string';
  const effective = prompt.body ?? (defaultKnown ? defaultBody : '');
  const [body, setBody] = useState(effective);
  const [note, setNote] = useState('');
  useEffect(() => { setBody(effective); setNote(''); }, [prompt.key, effective]);
  const dirty = body !== effective;
  const tooLong = body.length > BODY_MAX;
  const hasPlaceholder = /\{(role|job_category)\}/.test(body);
  const statusKey = !isDefault
    ? 'admin.prompts.effective.custom'
    : !defaultKnown ? null : defaultBody.trim() ? 'admin.prompts.effective.default' : 'admin.prompts.effective.empty';

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
        {!defaultKnown && isDefault ? <Alert variant="info"><AlertDescription>{t('admin.prompts.defaultUnavailable')}</AlertDescription></Alert> : null}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="prompt-body">{t('admin.prompts.body')}</Label>
            <span className={`text-xs ${tooLong ? 'text-error' : 'text-muted-foreground'}`}>{body.length}/{BODY_MAX}</span>
          </div>
          {statusKey ? <p role="status" className="text-xs text-muted-foreground">{t(statusKey)}</p> : null}
          <textarea
            id="prompt-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t(info.kind === 'replace' ? 'admin.prompts.bodyPlaceholder.replace' : 'admin.prompts.bodyPlaceholder.append')}
            className={TEXTAREA}
          />
          {hasPlaceholder ? <p className="text-xs text-muted-foreground">{t('admin.prompts.placeholderHint')}</p> : null}
        </div>

        {!isDefault && defaultKnown ? (
          <details className="rounded-xl border border-satin bg-surface-raised p-3 text-sm">
            <summary className="cursor-pointer text-muted-foreground">{t('admin.prompts.showDefault')}</summary>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{defaultBody.trim() ? defaultBody : t('admin.prompts.defaultEmpty')}</p>
          </details>
        ) : null}

        <div className="space-y-2"><Label htmlFor="prompt-note">{t('admin.prompts.changeNote')} *</Label><Input id="prompt-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('admin.prompts.changeNotePlaceholder')} /></div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {!dirty ? <span className="mr-auto text-xs text-muted-foreground">{t('admin.prompts.unchangedHint')}</span> : null}
          {dirty ? <Button type="button" variant="ghost" onClick={() => setBody(effective)} disabled={saving}>{t('admin.prompts.revert')}</Button> : null}
          <Button type="button" variant="outline" onClick={onReset} disabled={saving || isDefault}>{t('admin.prompts.reset')}</Button>
          <Button type="button" onClick={() => onSave(body, note.trim())} disabled={saving || !dirty || !body.trim() || !note.trim() || tooLong} loading={saving}>{t('admin.prompts.save')}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
