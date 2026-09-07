import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';

export function AdminSystemConfigPage() {
  const { t } = useLanguage();

  return (
    <AdminPageShell title={t('admin.systemConfig.title')} description={t('admin.systemConfig.description')}>
      <Alert variant="warning"><AlertDescription>{t('admin.systemConfig.dualSign')}</AlertDescription></Alert>
      <section className="grid gap-5 rounded-xl border border-subtle bg-surface-raised p-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="tenant-limit">{t('admin.systemConfig.tenantLimit')}</Label>
          <Input id="tenant-limit" value="500" readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="export-window">{t('admin.systemConfig.exportWindow')}</Label>
          <Input id="export-window" value="24h" readOnly />
        </div>
        <Button type="button">{t('admin.systemConfig.requestSign')}</Button>
      </section>
    </AdminPageShell>
  );
}
