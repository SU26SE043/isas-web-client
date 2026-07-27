import { useId, useState, type ReactNode } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CollapsibleDetailCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function CollapsibleDetailCard({
  title,
  icon: Icon,
  children,
  className,
}: CollapsibleDetailCardProps) {
  const [expanded, setExpanded] = useState(true);
  const contentId = useId();

  return (
    <Card className={className}>
      <CardHeader className={cn('py-3', expanded && 'pb-3')}>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg border border-chart-cat-6/30 bg-chart-cat-6/15 text-chart-cat-6">
              <Icon className="size-4" aria-hidden />
            </span>
            {title}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={title}
            aria-expanded={expanded}
            aria-controls={contentId}
            onClick={() => setExpanded((current) => !current)}
          >
            <ChevronDown
              className={cn('size-4 transition-transform', expanded && 'rotate-180')}
              aria-hidden
            />
          </Button>
        </div>
      </CardHeader>
      {expanded ? <CardContent id={contentId}>{children}</CardContent> : null}
    </Card>
  );
}
