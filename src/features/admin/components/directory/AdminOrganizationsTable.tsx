import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { AdminOrganization } from '../../types/adminDirectory.types';

export function AdminOrganizationsTable({ items }: { items: AdminOrganization[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.organizations.organization')}</TableHead>
              <TableHead>{t('admin.organizations.taxCode')}</TableHead>
              <TableHead>{t('admin.organizations.members')}</TableHead>
              <TableHead>{t('admin.organizations.createdAt')}</TableHead>
              <TableHead><span className="sr-only">{t('admin.table.actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell><p className="font-medium text-foreground">{item.name}</p><p className="text-xs text-muted-foreground">{item.id}</p></TableCell>
                <TableCell>{item.taxCode || '—'}</TableCell>
                <TableCell className="tabular-nums">{item.memberCount}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
                {/* Màn Ví đòi mã tổ chức — đưa thẳng sang thay vì bắt admin copy GUID tay. */}
                <TableCell><Link to={`/admin/billing?orgId=${encodeURIComponent(item.id)}`} className="text-sm text-info underline-offset-4 hover:underline">{t('admin.organizations.viewWallet')}</Link></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-satin bg-surface-overlay p-4">
            <p className="font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.id}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-muted-foreground">{t('admin.organizations.members')}</dt><dd>{item.memberCount}</dd></div>
              <div><dt className="text-muted-foreground">{t('admin.organizations.taxCode')}</dt><dd>{item.taxCode || '—'}</dd></div>
              <div className="col-span-2"><dt className="text-muted-foreground">{t('admin.organizations.createdAt')}</dt><dd>{formatDate(item.createdAt)}</dd></div>
            </dl>
            <Link to={`/admin/billing?orgId=${encodeURIComponent(item.id)}`} className="mt-3 inline-block text-sm text-info underline-offset-4 hover:underline">{t('admin.organizations.viewWallet')}</Link>
          </article>
        ))}
      </div>
    </>
  );
}
