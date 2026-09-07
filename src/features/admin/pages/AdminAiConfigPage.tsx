import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { useAdminPlatform } from '../hooks/useAdminPlatform';

export function AdminAiConfigPage() {
  const { t } = useLanguage();
  const { snapshot, saveAiConfig } = useAdminPlatform();
  const [threshold, setThreshold] = useState(72);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (snapshot?.aiConfig) setThreshold(snapshot.aiConfig.passingThreshold);
  }, [snapshot]);

  const submit = async () => {
    if (!snapshot) return;
    await saveAiConfig({ ...snapshot.aiConfig, passingThreshold: threshold });
    setSaved(true);
  };

  return (
    <AdminPageShell title={t('admin.ai.title')} description={t('admin.ai.description')}>
      <Alert variant="warning"><AlertDescription>{t('admin.ai.biasGuard')}</AlertDescription></Alert>
      {saved || snapshot?.aiConfig.pendingDualSign ? <Alert variant="info"><AlertDescription>{t('admin.ai.dualSign')}</AlertDescription></Alert> : null}
      <section className="grid gap-5 rounded-xl border border-subtle bg-surface-raised p-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="model">{t('admin.ai.model')}</Label>
          <Input id="model" value={snapshot?.aiConfig.model ?? ''} readOnly />
        </div>
        <div className="space-y-2">
          <Label htmlFor="threshold">{t('admin.ai.threshold')}</Label>
          <Input id="threshold" type="number" min={0} max={100} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minutes">{t('admin.ai.maxMinutes')}</Label>
          <Input id="minutes" value={snapshot?.aiConfig.maxSessionMinutes ?? ''} readOnly />
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-subtle bg-surface-overlay p-3 text-sm text-foreground">
          <input type="checkbox" checked={snapshot?.aiConfig.biasGuard ?? false} readOnly />
          {t('admin.ai.biasGuardEnabled')}
        </label>
        <Button type="button" onClick={submit}>{t('admin.ai.save')}</Button>
      </section>
    </AdminPageShell>
  );
}
