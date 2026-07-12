import { SwitchCamera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

export function AdminFeatureFlagsPage() {
  const { t } = useLanguage();
  const { snapshot } = useAdminPlatform();

  return (
    <AdminPageShell eyebrow="SCR-ADM-083" title={t('admin.flags.title')} description={t('admin.flags.description')}>
      <section className="grid gap-4 lg:grid-cols-2">
        {(snapshot?.flags ?? []).map((flag) => (
          <Card key={flag.id} className="border border-subtle bg-surface-raised">
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-medium text-foreground">{flag.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{flag.tenant}</p>
                <p className="mt-2 text-xs text-muted-foreground">{flag.isolated ? t('admin.flags.isolated') : t('admin.flags.shared')}</p>
              </div>
              <div className="flex items-center gap-3">
                <SwitchCamera className="h-4 w-4 text-muted-foreground" aria-hidden />
                <input type="checkbox" checked={flag.enabled} readOnly aria-label={flag.name} />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </AdminPageShell>
  );
}
