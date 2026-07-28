import type { ReactNode } from 'react';
import { Briefcase, Code2, Layers, Server } from 'lucide-react';
import { SelectionOption } from '@/components/ui/selection-option';
import { cn } from '@/lib/utils';
import { CAREER_POSITIONS } from '@/shared/domain/careerPositions';
import type { JobDomainId } from '@/shared/domain/jobDomains';
import { isJobDomainId } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import type { FlowWizardAccent } from './flowWizardAccent';
import { FLOW_WIZARD_ACCENT } from './flowWizardAccent';

const POSITION_ICONS: Record<JobDomainId, ReactNode> = {
  frontend: <Code2 className="size-5" aria-hidden />,
  backend: <Server className="size-5" aria-hidden />,
  'business-analyst': <Briefcase className="size-5" aria-hidden />,
};

export interface CareerPositionSelectorProps {
  selectedId: string | null;
  onSelect: (id: JobDomainId) => void;
  accent?: FlowWizardAccent;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function CareerPositionSelector({
  selectedId,
  onSelect,
  accent = 'blue',
  ariaLabel,
  disabled = false,
  className,
}: CareerPositionSelectorProps) {
  const { language } = useLanguage();
  const accentRing = FLOW_WIZARD_ACCENT[accent].ringSelected;

  return (
    <div
      className={cn('grid gap-3 sm:grid-cols-1', className)}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {CAREER_POSITIONS.map((position) => {
        const label = language === 'vi' ? position.labelVi : position.label;
        const selected = position.value === selectedId;
        const icon =
          isJobDomainId(position.value) && POSITION_ICONS[position.value]
            ? POSITION_ICONS[position.value]
            : <Layers className="size-5" aria-hidden />;

        return (
          <SelectionOption
            key={position.value}
            icon={icon}
            title={label}
            selected={selected}
            onClick={() => onSelect(position.value)}
            disabled={disabled}
            className={cn('w-full', selected ? `ring-2 ${accentRing}` : null)}
          />
        );
      })}
    </div>
  );
}
