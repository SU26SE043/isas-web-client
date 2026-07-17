import type { ReactNode } from 'react';
import { Briefcase, Code2, Server } from 'lucide-react';
import { JOB_DOMAINS } from '@/shared/domain/jobDomains';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import type { JobCategory } from '../types/rubric.types';

const CATEGORY_ICONS: Record<JobCategory, ReactNode> = {
  FE: <Code2 className="size-4" aria-hidden />,
  BE: <Server className="size-4" aria-hidden />,
  BA: <Briefcase className="size-4" aria-hidden />,
};

interface RubricCategoryTabsProps {
  value: JobCategory;
  onChange: (value: JobCategory) => void;
  disabled?: boolean;
}

export function RubricCategoryTabs({ value, onChange, disabled = false }: RubricCategoryTabsProps) {
  const { language } = useLanguage();

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Job category">
      {JOB_DOMAINS.map((domain) => {
        const category = domain.jobCategoryEnum;
        const selected = category === value;
        const label = language === 'vi' ? domain.nameVi : domain.name;

        return (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={disabled}
            onClick={() => onChange(category)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-out',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
              selected
                ? 'border-success/50 bg-success-bg text-foreground shadow-[0_0_0_1px_color-mix(in_srgb,var(--isas-success)_35%,transparent)]'
                : 'border-satin bg-surface-overlay/50 text-muted-foreground hover:border-[var(--border-focus)] hover:text-foreground',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            {CATEGORY_ICONS[category]}
            {label}
          </button>
        );
      })}
    </div>
  );
}
