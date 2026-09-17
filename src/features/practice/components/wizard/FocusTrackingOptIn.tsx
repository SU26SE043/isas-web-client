import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

interface FocusTrackingOptInProps {
  enabled: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

/**
 * B2C coaching (2026-09-17, BC-6 ngoại lệ) — người luyện TỰ BẬT ghi nhận mất tập trung
 * (rời tab/dán/mất focus + đếm mặt detect-only). Mặc định TẮT. KHÔNG dùng chữ mang nghĩa chống
 * gian lận ("vi phạm"/"giám sát"/"phát hiện") — đây là coaching, chỉ chính người luyện đọc lại.
 */
export function FocusTrackingOptIn({ enabled, onChange, disabled }: FocusTrackingOptInProps) {
  const { t } = useLanguage();

  return (
    <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-satin bg-surface-overlay px-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">
          {t('practice.setup.focusTracking.label')}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('practice.setup.focusTracking.description')}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={t('practice.setup.focusTracking.label')}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-white/15',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        )}
      >
        <span
          className={cn(
            'inline-block size-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}
