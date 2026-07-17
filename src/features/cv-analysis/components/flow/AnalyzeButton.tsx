import React from 'react';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/** Primary CTA — only this action calls POST .../practice/cv-analysis. */
export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  className,
}) => {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className={cn(
        'btn-primary inline-flex items-center justify-center gap-2 rounded-xl',
        (disabled || loading) && 'pointer-events-none opacity-60',
        className,
      )}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      <Sparkles className="size-4" aria-hidden />
      {loading ? t('cv.analyzing') : t('cv.startAnalysis')}
    </button>
  );
};
