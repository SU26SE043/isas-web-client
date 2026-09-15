import { Eye } from 'lucide-react';
import { useLanguage } from '@/shared/languages';

export function FocusTrackingOptIn({ enabled, onChange, disabled = false }: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <section className="mt-4 rounded-2xl border border-satin bg-surface-overlay p-4" aria-labelledby="focus-tracking-title">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby="focus-tracking-description"
          className="mt-1 size-4 rounded border-satin accent-foreground"
        />
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-satin bg-surface-raised text-foreground" aria-hidden>
          <Eye className="size-4" />
        </span>
        <span>
          <span id="focus-tracking-title" className="block font-medium text-foreground">
            {t('practice.setup.focusTracking.label')}
          </span>
          <span id="focus-tracking-description" className="mt-1 block text-xs leading-relaxed text-muted-foreground">
            {t('practice.setup.focusTracking.description')}
          </span>
        </span>
      </label>
    </section>
  );
}
