import { Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

export function ResultScoringPanel() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-subtle bg-surface-raised p-8 text-center shadow-sm">
      <div className="relative">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" aria-hidden />
        <Sparkles className="absolute -right-2 -top-2 h-4 w-4 text-foreground" aria-hidden />
      </div>
      <h2 className="heading-secondary mt-6 text-2xl text-foreground">{t('practice.result.scoring.title')}</h2>
      <p className="body-text mt-2 max-w-md text-sm text-muted-foreground">
        {t('practice.result.scoring.description')}
      </p>
      <p className="mt-4 text-xs text-muted-foreground">{t('practice.result.scoring.hint')}</p>
    </div>
  );
}
