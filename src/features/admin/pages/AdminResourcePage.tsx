import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/shared/languages';
import { AdminDataTable } from '../components/AdminDataTable';
import { AdminPageShell } from '../components/AdminPageShell';
import { useAdminPlatform } from '../hooks/useAdminPlatform';
import type { AdminResourceKey } from '../types/admin.types';
import { ADMIN_RESOURCE_CONFIGS } from './adminPageConfigs';

export function AdminResourcePage({ resourceKey }: { resourceKey: AdminResourceKey }) {
  const { t } = useLanguage();
  const { snapshot, approveResource } = useAdminPlatform();
  const config = ADMIN_RESOURCE_CONFIGS[resourceKey];

  return (
    <AdminPageShell eyebrow={config.screenId} title={t(config.titleKey)} description={t(config.descriptionKey)}>
      <Alert variant="info"><AlertDescription>{t(config.ruleKey)}</AlertDescription></Alert>
      <AdminDataTable rows={snapshot?.resources[resourceKey] ?? []} resource={resourceKey} onApprove={approveResource} />
    </AdminPageShell>
  );
}
