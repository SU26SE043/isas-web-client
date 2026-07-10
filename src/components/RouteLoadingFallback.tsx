import { useLanguage } from '@/shared/languages';
import { Spinner } from '@/components/ui/spinner';

export function RouteLoadingFallback() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[40vh] items-center justify-center surface-base" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="size-8" label={t('ds.loading.page')} />
        <span className="text-sm text-muted-foreground">{t('ds.loading.page')}</span>
      </div>
    </div>
  );
}
