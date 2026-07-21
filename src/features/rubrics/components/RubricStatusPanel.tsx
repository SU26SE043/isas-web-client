import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
interface RubricStatusPanelProps {
  isCustom: boolean;
  disabled?: boolean;
  onReset: () => void;
}

export function RubricStatusPanel({ isCustom, disabled = false, onReset }: RubricStatusPanelProps) {
  const { t } = useLanguage();

  if (!isCustom) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-end">
      <div className="frame-satin min-w-[14rem] rounded-xl border border-satin bg-surface-raised px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="size-2 shrink-0 rounded-full bg-success" aria-hidden />
          <p className="text-sm font-semibold text-foreground">{t('rubrics.badge.custom')}</p>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t('rubrics.hint.custom')}</p>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled}
        onClick={onReset}
        className="shrink-0"
      >
        <RotateCcw className="size-4" aria-hidden />
        {t('rubrics.reset.button')}
      </Button>
    </div>
  );
}
