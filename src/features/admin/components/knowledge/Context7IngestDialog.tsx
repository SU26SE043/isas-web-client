import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import type { Context7Library, IngestContext7Input } from '../../types/adminApi.types';
import { KNOWLEDGE_CATEGORIES, parseTopics, type KnowledgeCategory } from '../../utils/adminKnowledge';
import { SELECT_CLASS } from '../common/OrgPicker';

interface Context7IngestDialogProps {
  open: boolean; searching: boolean; ingesting: boolean; results: Context7Library[] | null; errorMessage: string | null;
  onSearch: (libraryName: string) => void; onIngest: (input: IngestContext7Input) => void; onClose: () => void;
}

/**
 * Nạp từ Context7: tìm thư viện → chọn ĐÚNG MỘT (uy tín hiện cạnh tên — search "react" trả 5 thư viện
 * cùng tên uy tín 8.3→10, chọn mù là nạp nhầm fork) → gõ chủ đề (mỗi dòng một) → Nạp = 1 nguồn mới.
 */
export function Context7IngestDialog({ open, searching, ingesting, results, errorMessage, onSearch, onIngest, onClose }: Context7IngestDialogProps) {
  const { t } = useLanguage();
  const [libraryName, setLibraryName] = useState('');
  const [selected, setSelected] = useState<Context7Library | null>(null);
  const [topicsRaw, setTopicsRaw] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('FE');
  const topics = parseTopics(topicsRaw);
  const busy = searching || ingesting;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent showCloseButton={!busy}>
        <DialogHeader><DialogTitle>{t('admin.knowledge.c7.title')}</DialogTitle><DialogDescription>{t('admin.knowledge.c7.description')}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-48 flex-1 space-y-1.5"><Label htmlFor="c7-library">{t('admin.knowledge.c7.library')}</Label><Input id="c7-library" value={libraryName} disabled={busy} onChange={(event) => setLibraryName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && libraryName.trim()) onSearch(libraryName.trim()); }} placeholder={t('admin.knowledge.c7.libraryPlaceholder')} /></div>
            <Button type="button" variant="outline" loading={searching} disabled={!libraryName.trim() || ingesting} onClick={() => onSearch(libraryName.trim())}>{t('admin.knowledge.c7.search')}</Button>
          </div>
          {results && results.length === 0 ? <p className="text-sm text-muted-foreground">{t('admin.knowledge.c7.noResults')}</p> : null}
          {results && results.length > 0 ? (
            <ul className="max-h-48 divide-y divide-satin overflow-auto rounded-lg border border-satin" aria-label={t('admin.knowledge.c7.results')}>
              {results.map((lib) => (
                <li key={lib.id}>
                  <button type="button" disabled={busy} aria-pressed={selected?.id === lib.id} className={`flex w-full flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-surface-overlay ${selected?.id === lib.id ? 'bg-surface-overlay' : ''}`} onClick={() => setSelected(lib)}>
                    <span className="text-foreground">{lib.title} <span className="font-mono text-xs text-muted-foreground">{lib.id}</span></span>
                    <span className="text-xs text-muted-foreground">{t('admin.knowledge.c7.meta').replace('{rep}', lib.reputation ?? '—').replace('{n}', String(lib.snippets))}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {selected ? (
            <>
              <div className="space-y-1.5"><Label htmlFor="c7-topics">{t('admin.knowledge.c7.topics')}</Label><Textarea id="c7-topics" rows={4} value={topicsRaw} disabled={busy} onChange={(event) => setTopicsRaw(event.target.value)} placeholder={t('admin.knowledge.c7.topicsPlaceholder')} /><p className="text-xs text-muted-foreground">{t('admin.knowledge.c7.topicsHint').replace('{n}', String(topics.length))}</p></div>
              <div className="space-y-1.5"><Label htmlFor="c7-category">{t('admin.knowledge.add.category')}</Label>
                <select id="c7-category" className={SELECT_CLASS} value={category} disabled={busy} onChange={(event) => setCategory(event.target.value as KnowledgeCategory)}>
                  {KNOWLEDGE_CATEGORIES.map((c) => <option key={c} value={c}>{t(`admin.knowledge.category.${c}`)}</option>)}
                </select></div>
            </>
          ) : null}
          {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t('admin.rubrics.cancel')}</Button>
          <Button type="button" loading={ingesting} disabled={!selected || topics.length === 0 || searching} onClick={() => selected && onIngest({ libraryId: selected.id, topics, jobCategory: category })}>{t('admin.knowledge.c7.ingest')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
