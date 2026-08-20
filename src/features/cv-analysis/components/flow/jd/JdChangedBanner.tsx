import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';

export interface JdChangedBannerProps {
  onRefresh: () => void;
  onKeep: () => void;
}

/**
 * One banner for the whole section — never a badge on each row.
 * The JD changed; that is a fact about the JD, not about 14 separate rows.
 */
export function JdChangedBanner({ onRefresh, onKeep }: JdChangedBannerProps) {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-warning/30 bg-warning-bg px-3 py-3"
    >
      <p className="text-sm font-medium text-foreground">{t('cv.jd.changed.title')}</p>
      <p className="mt-1 text-xs text-muted-foreground">{t('cv.jd.changed.description')}</p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          size="lg"
          className="min-h-11 w-full sm:w-auto"
          onClick={onRefresh}
        >
          <RefreshCw aria-hidden />
          {t('cv.jd.changed.refresh')}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-11 w-full sm:w-auto"
          onClick={onKeep}
        >
          {t('cv.jd.changed.keep')}
        </Button>
      </div>
    </div>
  );
}
