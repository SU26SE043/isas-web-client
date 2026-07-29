import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { AdminDirectoryUser } from '../../types/adminDirectory.types';
import { AdminStatusBadge } from '../AdminStatusBadge';

export function AdminUsersTable({ items }: { items: AdminDirectoryUser[] }) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value));

  return (
    <>
      <div className="hidden md:block">
        <Table className="min-w-[880px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.users.user')}</TableHead>
              <TableHead>{t('admin.users.role')}</TableHead>
              <TableHead>{t('admin.users.tenant')}</TableHead>
              <TableHead>{t('admin.table.status')}</TableHead>
              <TableHead>{t('admin.users.createdAt')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell><p className="font-medium text-foreground">{item.fullName || item.email}</p><p className="text-xs text-muted-foreground">{item.email}</p></TableCell>
                <TableCell>{t(`admin.userRole.${item.role}`)}{item.orgRole ? <p className="text-xs text-muted-foreground">{item.orgRole}</p> : null}</TableCell>
                <TableCell><p>{item.orgName || '—'}</p>{item.orgId ? <p className="text-xs text-muted-foreground">{item.orgId}</p> : null}</TableCell>
                <TableCell><AdminStatusBadge status={item.bannedAt ? 'suspended' : 'active'} />{item.banReason ? <p className="mt-1 max-w-48 text-xs text-muted-foreground">{item.banReason}</p> : null}</TableCell>
                <TableCell>{formatDate(item.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-satin bg-surface-overlay p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold text-foreground">{item.fullName || item.email}</p><p className="text-xs text-muted-foreground">{item.email}</p></div>
              <AdminStatusBadge status={item.bannedAt ? 'suspended' : 'active'} />
            </div>
            <p className="mt-3 text-sm">{t(`admin.userRole.${item.role}`)}{item.orgRole ? ` · ${item.orgRole}` : ''}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.orgName || t('admin.users.noOrganization')}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t('admin.users.createdAt')}: {formatDate(item.createdAt)}</p>
            {item.banReason ? <p className="mt-2 text-xs text-destructive">{item.banReason}</p> : null}
          </article>
        ))}
      </div>
    </>
  );
}
