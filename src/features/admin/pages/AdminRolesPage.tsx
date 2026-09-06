import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

export function AdminRolesPage() {
  const { t } = useLanguage();
  const { snapshot } = useAdminPlatform();

  return (
    <AdminPageShell title={t('admin.roles.title')} description={t('admin.roles.description')}>
      <section className="grid gap-4 lg:grid-cols-3">
        {(snapshot?.roles ?? []).map((role) => (
          <Card key={role.id} className="border border-subtle bg-surface-raised">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{t(role.nameKey)}</CardTitle>
                <Shield className="h-5 w-5 text-muted-foreground" aria-hidden />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{t(role.descriptionKey)}</p>
              <p className="text-sm text-foreground">{t('admin.roles.users')}: <span className="font-semibold">{role.users}</span></p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span key={permission} className="rounded-full border border-subtle bg-surface-overlay px-2 py-1 text-xs text-muted-foreground">{permission}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </AdminPageShell>
  );
}
