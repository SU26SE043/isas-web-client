import { CheckCircle2, ListChecks } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { JdRequirementsResponse } from '../../types/cvAnalysis.types';

interface CvJdRequirementsPanelProps {
  requirements: JdRequirementsResponse;
}

export function CvJdRequirementsPanel({ requirements }: CvJdRequirementsPanelProps) {
  const { t } = useLanguage();
  const groups = [
    { key: 'mustHave', title: t('cv.requirements.mustHave'), items: requirements.mustHave },
    { key: 'niceToHave', title: t('cv.requirements.niceToHave'), items: requirements.niceToHave },
  ] as const;
  const total = requirements.mustHave.length + requirements.niceToHave.length;

  return (
    <section className="rounded-xl border border-satin bg-white/[0.04] p-4" aria-live="polite">
      <div className="flex items-start gap-3">
        <ListChecks className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{t('cv.requirements.title')}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('cv.requirements.count').replace('{count}', String(total))}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {groups.map((group) => (
          <div key={group.key}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {group.title} ({group.items.length})
            </h4>
            {group.items.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {group.items.map((item, index) => (
                  <li key={`${group.key}-${index}`} className="flex gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                    <span className="min-w-0 [overflow-wrap:anywhere]">{item.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{t('cv.requirements.empty')}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
