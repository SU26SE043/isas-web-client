import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import type { CreateKnowledgeInput } from '../../types/adminApi.types';
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from '../../utils/adminKnowledge';
import { SELECT_CLASS } from '../common/OrgPicker';

interface KnowledgeAddDialogProps { open: boolean; loading: boolean; errorMessage: string | null; onClose: () => void; onSubmit: (input: CreateKnowledgeInput) => void }

/**
 * Thêm nguồn tri thức: URL (BE tải HTML + tách theo heading) hoặc Dán tay (markdown). `jobCategory` bắt buộc
 * — BE `[Required]` và từ chối khoá lạ, nên form chỉ gửi đúng field của loại đã chọn (không gửi cả `url`
 * lẫn `content`).
 */
export function KnowledgeAddDialog({ open, loading, errorMessage, onClose, onSubmit }: KnowledgeAddDialogProps) {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('BE');
  const [sourceType, setSourceType] = useState<'Url' | 'Manual'>('Url');
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const urlValid = /^https?:\/\/\S+$/i.test(url.trim());
  const canSubmit = title.trim().length > 0 && (sourceType === 'Url' ? urlValid : content.trim().length >= 50);

  const submit = () => onSubmit({ title: title.trim(), jobCategory: category, sourceType, ...(sourceType === 'Url' ? { url: url.trim() } : { content: content.trim() }) });

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !loading) onClose(); }}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader><DialogTitle>{t('admin.knowledge.add.title')}</DialogTitle><DialogDescription>{t('admin.knowledge.add.description')}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5"><Label htmlFor="kn-title">{t('admin.knowledge.add.name')}</Label><Input id="kn-title" value={title} disabled={loading} onChange={(event) => setTitle(event.target.value)} placeholder={t('admin.knowledge.add.namePlaceholder')} /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="kn-category">{t('admin.knowledge.add.category')}</Label>
              <select id="kn-category" className={SELECT_CLASS} value={category} disabled={loading} onChange={(event) => setCategory(event.target.value as KnowledgeCategory)}>
                {KNOWLEDGE_CATEGORIES.map((c) => <option key={c} value={c}>{t(`admin.knowledge.category.${c}`)}</option>)}
              </select></div>
            <div className="space-y-1.5"><Label htmlFor="kn-type">{t('admin.knowledge.add.type')}</Label>
              <select id="kn-type" className={SELECT_CLASS} value={sourceType} disabled={loading} onChange={(event) => setSourceType(event.target.value as 'Url' | 'Manual')}>
                <option value="Url">{t('admin.knowledge.type.url')}</option><option value="Manual">{t('admin.knowledge.type.manual')}</option>
              </select></div>
          </div>
          {sourceType === 'Url' ? (
            <div className="space-y-1.5"><Label htmlFor="kn-url">{t('admin.knowledge.add.url')}</Label><Input id="kn-url" value={url} disabled={loading} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" aria-invalid={url.trim().length > 0 && !urlValid ? true : undefined} /><p className="text-xs text-muted-foreground">{t('admin.knowledge.add.urlHint')}</p></div>
          ) : (
            <div className="space-y-1.5"><Label htmlFor="kn-content">{t('admin.knowledge.add.content')}</Label><Textarea id="kn-content" rows={8} value={content} disabled={loading} onChange={(event) => setContent(event.target.value)} placeholder={t('admin.knowledge.add.contentPlaceholder')} /><p className="text-xs text-muted-foreground">{t('admin.knowledge.add.contentHint')}</p></div>
          )}
          {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>{t('admin.rubrics.cancel')}</Button>
          <Button type="button" loading={loading} disabled={!canSubmit} onClick={submit}>{t('admin.knowledge.add.submit')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
