import { useLanguage } from '@/shared/languages';
import { ErrorPage } from '@/components/patterns/ErrorPage';

export function ForbiddenPage() {
  const { t } = useLanguage();
  return (
    <ErrorPage
      code={403}
      title={t('ds.error.forbiddenTitle')}
      description={t('ds.error.forbiddenDescription')}
      actionLabel={t('ds.error.goHome')}
    />
  );
}

export function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <ErrorPage
      code={404}
      title={t('ds.error.notFoundTitle')}
      description={t('ds.error.notFoundDescription')}
      actionLabel={t('ds.error.goHome')}
    />
  );
}

export function ServerErrorPage() {
  const { t } = useLanguage();
  return (
    <ErrorPage
      code={500}
      title={t('ds.error.serverTitle')}
      description={t('ds.error.serverDescription')}
      actionLabel={t('ds.error.reload')}
      onAction={() => window.location.reload()}
    />
  );
}

export function MaintenancePage() {
  const { t } = useLanguage();
  return (
    <main className="flex min-h-screen items-center justify-center surface-base px-4">
      <div className="max-w-lg text-center">
        <p className="text-label mb-3">{t('ds.error.maintenanceLabel')}</p>
        <h1 className="heading-primary text-3xl">{t('ds.error.maintenanceTitle')}</h1>
        <p className="body-text mt-3">{t('ds.error.maintenanceDescription')}</p>
      </div>
    </main>
  );
}
