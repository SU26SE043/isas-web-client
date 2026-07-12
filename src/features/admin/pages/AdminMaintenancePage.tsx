import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

export function AdminMaintenancePage() {
  const { t, language } = useLanguage();
  const { snapshot, scheduleMaintenance } = useAdminPlatform();
  const [title, setTitle] = useState('API maintenance window');
  const [saved, setSaved] = useState(false);
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';

  const submit = async () => {
    await scheduleMaintenance(title);
    setSaved(true);
  };

  return (
    <AdminPageShell eyebrow="SCR-ADM-087" title={t('admin.maintenance.title')} description={t('admin.maintenance.description')}>
      <Alert variant="warning"><AlertDescription>{t('admin.maintenance.rule')}</AlertDescription></Alert>
      {saved ? <Alert variant="success"><AlertDescription>{t('admin.maintenance.saved')}</AlertDescription></Alert> : null}
      <div className="flex max-w-xl gap-2 rounded-xl border border-subtle bg-surface-raised p-3">
        <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        <Button type="button" onClick={submit}>{t('admin.maintenance.schedule')}</Button>
      </div>
      <section className="space-y-3">
        {(snapshot?.maintenance ?? []).map((window) => (
          <div key={window.id} className="rounded-xl border border-subtle bg-surface-raised p-4">
            <p className="font-medium text-foreground">{window.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(window.startsAt))}
            </p>
          </div>
        ))}
      </section>
    </AdminPageShell>
  );
}
