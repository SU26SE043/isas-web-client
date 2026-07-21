import type { ReactNode } from 'react';
import { useLanguage } from '@/shared/languages';

interface CampaignReviewSectionProps {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}

/** Titled summary block with a jump-to-step "Edit" action, used by the Review step. */
export function CampaignReviewSection({ title, onEdit, children }: CampaignReviewSectionProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-2 rounded-xl border border-satin bg-surface-overlay p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button type="button" className="btn-ghost text-xs" onClick={onEdit}>
          {t('employer.campaigns.wizard.editStep')}
        </button>
      </div>
      <div className="space-y-1 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}
