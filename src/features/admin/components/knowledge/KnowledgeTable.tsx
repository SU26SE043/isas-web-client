import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { KnowledgeSource } from '../../types/adminApi.types';
import { knowledgeStatusKey, sourceTypeKey } from '../../utils/adminKnowledge';

interface KnowledgeTableProps { items: KnowledgeSource[]; busyId: string | null; onReindex: (item: KnowledgeSource) => void; onDelete: (item: KnowledgeSource) => void }

export function KnowledgeTable({ items, busyId, onReindex, onDelete }: KnowledgeTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const date = (iso: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(iso));
  return (
    <Table className="min-w-[900px]" aria-label={t('admin.knowledge.title')}>
      <TableHeader><TableRow>
        <TableHead>{t('admin.knowledge.table.title')}</TableHead><TableHead>{t('admin.knowledge.table.category')}</TableHead><TableHead>{t('admin.knowledge.table.type')}</TableHead>
        <TableHead className="text-right">{t('admin.knowledge.table.chunks')}</TableHead><TableHead className="text-right">{t('admin.knowledge.table.reputation')}</TableHead>
        <TableHead>{t('admin.knowledge.table.status')}</TableHead><TableHead>{t('admin.knowledge.table.createdAt')}</TableHead><TableHead className="text-right">{t('admin.knowledge.table.actions')}</TableHead>
      </TableRow></TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="max-w-72">
              <p className="truncate font-medium text-foreground" title={item.title}>{item.title}</p>
              {item.sourceRef ? <a href={item.sourceRef} target="_blank" rel="noreferrer" className="block truncate text-xs text-info underline-offset-4 hover:underline" title={item.sourceRef}>{item.sourceRef}</a> : null}
            </TableCell>
            <TableCell>{item.jobCategory ?? '—'}</TableCell>
            <TableCell>{t(sourceTypeKey(item.sourceType))}</TableCell>
            <TableCell className="text-right tabular-nums">{item.chunkCount}</TableCell>
            <TableCell className="text-right tabular-nums">{item.reputation ?? '—'}</TableCell>
            <TableCell><Badge variant={item.status === 'Active' ? 'success' : 'outline'}>{t(knowledgeStatusKey(item.status))}</Badge></TableCell>
            <TableCell className="whitespace-nowrap">{date(item.createdAt)}</TableCell>
            <TableCell className="whitespace-nowrap text-right">
              <Button type="button" variant="ghost" size="sm" disabled={busyId !== null} loading={busyId === item.id} onClick={() => onReindex(item)}>{t('admin.knowledge.reindex')}</Button>
              <Button type="button" variant="ghost" size="sm" className="text-error" disabled={busyId !== null} onClick={() => onDelete(item)}>{t('admin.knowledge.delete')}</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
