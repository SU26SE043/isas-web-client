import { LockKeyhole } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { AdminStatusBadge } from '../components/AdminStatusBadge';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

export function AdminAuditLogsPage() {
  const { t, language } = useLanguage();
  const { snapshot } = useAdminPlatform();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  return (
    <AdminPageShell eyebrow="SCR-ADM-081" title={t('admin.audit.title')} description={t('admin.audit.description')}>
      <Alert variant="warning"><LockKeyhole aria-hidden /><AlertDescription>{t('admin.audit.immutable')}</AlertDescription></Alert>
      <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
        <Table>
          <TableHeader className="bg-surface-base text-xs uppercase tracking-wide text-muted-foreground">
            <TableRow>
              <TableHead>{t('admin.audit.action')}</TableHead>
              <TableHead>{t('admin.audit.actor')}</TableHead>
              <TableHead>{t('admin.audit.target')}</TableHead>
              <TableHead>{t('admin.audit.hash')}</TableHead>
              <TableHead>{t('admin.table.status')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(snapshot?.auditLogs ?? []).map((log) => (
              <TableRow key={log.id}>
                <TableCell><p className="font-medium text-foreground">{t(log.actionKey)}</p><p className="text-xs text-muted-foreground">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(log.createdAt))}</p></TableCell>
                <TableCell>{log.actor}</TableCell>
                <TableCell className="text-muted-foreground">{log.target}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{log.hash}</TableCell>
                <TableCell><AdminStatusBadge status={log.severity} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminPageShell>
  );
}
