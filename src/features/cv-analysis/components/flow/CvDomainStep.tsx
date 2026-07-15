import React from 'react';
import { Briefcase, Code2, Layers, Server } from 'lucide-react';
import { SelectionOption } from '@/components/ui/selection-option';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { CvAnalysisDomain } from '../../types/cvDomain.types';
import { CV_ANALYSIS_DOMAINS } from '../../types/cvDomain.types';
import { CvFlowSectionCard } from './CvFlowSectionCard';

const DOMAIN_ICONS: Record<CvAnalysisDomain, React.ReactNode> = {
  frontend: <Code2 className="size-5" aria-hidden />,
  backend: <Server className="size-5" aria-hidden />,
  'business-analyst': <Briefcase className="size-5" aria-hidden />,
};

interface CvDomainStepProps {
  domain: CvAnalysisDomain | null;
  onSelect: (domain: CvAnalysisDomain) => void;
  onNext: () => void;
}

export const CvDomainStep: React.FC<CvDomainStepProps> = ({ domain, onSelect, onNext }) => {
  const { t } = useLanguage();
  const canNext = Boolean(domain);

  return (
    <CvFlowSectionCard
      title={t('cv.step.domain')}
      description={t('cv.stepDesc.domain')}
    >
      <div
        className="grid gap-3 sm:grid-cols-1"
        role="radiogroup"
        aria-label={t('cv.domain.groupLabel')}
      >
        {CV_ANALYSIS_DOMAINS.map((id) => (
          <SelectionOption
            key={id}
            icon={DOMAIN_ICONS[id] ?? <Layers className="size-5" aria-hidden />}
            title={t(`cv.domain.${id}.title`)}
            description={t(`cv.domain.${id}.description`)}
            selected={domain === id}
            onClick={() => onSelect(id)}
            className="w-full"
          />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className={cn(
            'inline-flex min-w-[7.5rem] items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-[background-color,border-color,opacity,transform] duration-200 ease-out',
            canNext
              ? 'btn-primary'
              : 'frame-satin cursor-not-allowed bg-white/[0.04] text-muted-foreground opacity-70',
          )}
          disabled={!canNext}
          onClick={onNext}
        >
          {t('cv.next')}
        </button>
      </div>
    </CvFlowSectionCard>
  );
};
