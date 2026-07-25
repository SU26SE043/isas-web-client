import { Ban, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

export function AdminUsersPage() {
  const { t, language } = useLanguage();
  const { snapshot, suspendUser } = useAdminPlatform();
  const [search, setSearch] = useState('');
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const users = useMemo(() => (snapshot?.users ?? []).filter((user) => `${user.name} ${user.email} ${user.tenant}`.toLowerCase().includes(search.toLowerCase())), [snapshot, search]);

  return (
    <AdminPageShell eyebrow="SCR-ADM-070" title={t('admin.users.title')} description={t('admin.users.description')}>
      <div className="flex max-w-md items-center gap-2 rounded-xl border border-subtle bg-surface-raised p-2">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('admin.users.search')} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('admin.users.user')}</TableHead>
            <TableHead>{t('admin.users.role')}</TableHead>
            <TableHead>{t('admin.users.tenant')}</TableHead>
            <TableHead>{t('admin.users.mfa')}</TableHead>
            <TableHead>{t('admin.table.status')}</TableHead>
            <TableHead className="text-right">{t('admin.table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell><p className="font-medium text-foreground">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></TableCell>
              <TableCell>{t(`admin.userRole.${user.role}`)}</TableCell>
              <TableCell>{user.tenant}</TableCell>
              <TableCell>{user.mfaEnabled ? t('admin.common.yes') : t('admin.common.no')}</TableCell>
              <TableCell><AdminStatusBadge status={user.status} /></TableCell>
              <TableCell className="text-right">
                <Button variant="outline" size="sm" onClick={() => suspendUser(user.id)}>
                  <Ban aria-hidden />
                  {t('admin.users.suspend')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-muted-foreground">{t('admin.users.sessionRule')} · {new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date())}</p>
    </AdminPageShell>
  );
}
