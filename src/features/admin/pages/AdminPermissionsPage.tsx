import { Check, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

export function AdminPermissionsPage() {
  const { t } = useLanguage();
  const { snapshot } = useAdminPlatform();

  return (
    <AdminPageShell eyebrow="SCR-ADM-072" title={t('admin.permissions.title')} description={t('admin.permissions.description')}>
      <section className="grid gap-4 lg:grid-cols-3">
        {(snapshot?.permissionGroups ?? []).map((group) => (
          <Card key={group.id} className="border border-subtle bg-surface-raised">
            <CardHeader><CardTitle>{t(group.labelKey)}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {group.permissions.map((permission) => (
                <div key={permission} className="flex items-center justify-between rounded-lg border border-subtle bg-surface-overlay p-3">
                  <span className="text-sm text-foreground">{permission}</span>
                  {permission.includes('sign') ? <Lock className="h-4 w-4 text-warning" aria-hidden /> : <Check className="h-4 w-4 text-success" aria-hidden />}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </AdminPageShell>
  );
}
