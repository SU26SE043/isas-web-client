import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { NotificationPreferences } from '../types/engagement.types';

interface SettingsFormProps {
  preferences: NotificationPreferences | null;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
}

export function SettingsForm({ preferences, onSave }: SettingsFormProps) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<NotificationPreferences | null>(preferences);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(preferences);
  }, [preferences]);

  if (!draft) return <div className="h-64 animate-pulse rounded-xl border border-subtle bg-surface-raised" />;

  const update = (key: keyof NotificationPreferences, value: boolean | string) => setDraft({ ...draft, [key]: value });
  const submit = async () => {
    await onSave(draft);
    setSaved(true);
  };

  return (
    <section className="space-y-5 rounded-xl border border-subtle bg-surface-raised p-5">
      {saved ? <p className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success">{t('engagement.settings.saved')}</p> : null}
      <div className="grid gap-3 md:grid-cols-3">
        {(['email', 'inApp', 'marketing'] as const).map((key) => (
          <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-subtle bg-surface-overlay p-3 text-sm text-foreground">
            {t(`engagement.settings.${key}`)}
            <input type="checkbox" checked={draft[key]} onChange={(event) => update(key, event.target.checked)} />
          </label>
        ))}
      </div>
      <label className="flex items-center justify-between gap-3 rounded-lg border border-subtle bg-surface-overlay p-3 text-sm text-foreground">
        {t('engagement.settings.quietHours')}
        <input type="checkbox" checked={draft.quietHours} onChange={(event) => update('quietHours', event.target.checked)} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quietStart">{t('engagement.settings.quietStart')}</Label>
          <Input id="quietStart" type="time" value={draft.quietStart} onChange={(event) => update('quietStart', event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quietEnd">{t('engagement.settings.quietEnd')}</Label>
          <Input id="quietEnd" type="time" value={draft.quietEnd} onChange={(event) => update('quietEnd', event.target.value)} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t('engagement.settings.marketingRule')}</p>
      <Button type="button" onClick={submit}>
        <Save aria-hidden />
        {t('engagement.settings.save')}
      </Button>
    </section>
  );
}
