import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { CampaignViolationKind } from '../types/campaignViolation.types';

type BehaviorWarningKind = Extract<CampaignViolationKind, 'tab_switch' | 'paste' | 'focus_lost'>;

interface CampaignBehaviorWarningProps {
  kind: BehaviorWarningKind | null;
  onDismiss: () => void;
}

export const CAMPAIGN_BEHAVIOR_WARNING_MS = 5_000;

const MESSAGE_KEYS: Record<BehaviorWarningKind, string> = {
  tab_switch: 'campaigns.violation.tabSwitch',
  paste: 'campaigns.violation.paste',
  focus_lost: 'campaigns.violation.focusLost',
};

export function CampaignBehaviorWarning({ kind, onDismiss }: CampaignBehaviorWarningProps) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!kind) return undefined;
    const timer = window.setTimeout(onDismiss, CAMPAIGN_BEHAVIOR_WARNING_MS);
    return () => window.clearTimeout(timer);
  }, [kind, onDismiss]);

  if (!kind) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[120] grid place-items-center bg-white/70 px-4 backdrop-blur-md"
      role="status"
      aria-live="assertive"
      aria-atomic="true"
    >
      <section className="pointer-events-none w-full max-w-md rounded-2xl border border-error/40 bg-surface-elevated p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full border border-error/40 bg-error/10 text-error">
            <TriangleAlert className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-error">{t('campaigns.violation.title')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t(MESSAGE_KEYS[kind])}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
