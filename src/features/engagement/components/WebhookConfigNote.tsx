import { useLanguage } from '@/shared/languages';

export function WebhookConfigNote() {
  const { t } = useLanguage();

  return (
    <section className="rounded-xl border border-subtle bg-surface-raised p-5">
      <h2 className="text-base font-semibold text-foreground">{t('engagement.webhook.title')}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t('engagement.webhook.description')}</p>
      <p className="mt-3 text-xs text-muted-foreground">{t('engagement.webhook.rule')}</p>
    </section>
  );
}
