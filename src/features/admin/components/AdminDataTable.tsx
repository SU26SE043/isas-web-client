import { Check, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { AdminResourceKey, AdminTableRow } from '../types/admin.types';
import { AdminStatusBadge } from './AdminStatusBadge';

interface AdminDataTableProps {
  rows: AdminTableRow[];
  resource: AdminResourceKey;
  onApprove?: (resource: AdminResourceKey, id: string) => void;
}

export function AdminDataTable({ rows, resource, onApprove }: AdminDataTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        <p className="font-medium text-foreground">{t('admin.empty.title')}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t('admin.empty.description')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <Table>
        <TableHeader className="bg-surface-base text-xs uppercase tracking-wide text-muted-foreground">
          <TableRow>
            <TableHead>{t('admin.table.item')}</TableHead>
            <TableHead>{t('admin.table.owner')}</TableHead>
            <TableHead>{t('admin.table.status')}</TableHead>
            <TableHead>{t('admin.table.updated')}</TableHead>
            <TableHead className="text-right">{t('admin.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <p className="font-medium text-foreground">{row.primary}</p>
                <p className="text-xs text-muted-foreground">{row.secondary}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{row.owner}</TableCell>
              <TableCell><AdminStatusBadge status={row.status} /></TableCell>
              <TableCell className="text-muted-foreground">{formatDate(row.updatedAt)}</TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => onApprove?.(resource, row.id)}>
                  {row.status === 'pending' ? <Check aria-hidden /> : <ShieldAlert aria-hidden />}
                  {row.status === 'pending' ? t('admin.action.approve') : t('admin.action.review')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
