import { useLanguage } from '@/shared/languages';

interface InterviewHistoryCompareBarProps {
  selectedCount: number;
  onCompare: () => void;
  onCancel: () => void;
}

export function InterviewHistoryCompareBar({
  selectedCount,
  onCompare,
  onCancel,
}: InterviewHistoryCompareBarProps) {
  const { t } = useLanguage();

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-subtle bg-surface-raised px-4 py-3">
      <p className="text-sm text-muted-foreground">
        {t('practice.compare.selectedCount').replace('{count}', String(selectedCount))}
      </p>
      <div className="flex gap-2">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          {t('practice.compare.cancel')}
        </button>
        <button type="button" className="btn-primary" disabled={selectedCount !== 2} onClick={onCompare}>
          {t('practice.compare.start')}
        </button>
      </div>
    </div>
  );
}
