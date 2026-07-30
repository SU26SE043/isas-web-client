import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';

export function CampaignOverviewDescription({ description }: { description: string }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        id="campaign-overview-description"
        className={cn(
          'font-medium leading-relaxed text-foreground/90',
          !expanded && 'line-clamp-2',
        )}
      >
        {description}
      </p>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-1 -ml-2 text-info-light hover:bg-info/10 hover:text-info-light"
        aria-expanded={expanded}
        aria-controls="campaign-overview-description"
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded
          ? t('employer.campaigns.detail.showLess')
          : t('employer.campaigns.detail.showMore')}
        {expanded ? (
          <ChevronUp className="size-4" aria-hidden />
        ) : (
          <ChevronDown className="size-4" aria-hidden />
        )}
      </Button>
    </div>
  );
}
