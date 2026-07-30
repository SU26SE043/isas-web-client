import type { LucideIcon } from 'lucide-react';

interface CampaignDetailMetricProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function CampaignDetailMetric({
  icon: Icon,
  label,
  value,
}: CampaignDetailMetricProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-info/15 bg-info/[0.05] px-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info-light">
        <Icon className="size-4" aria-hidden />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
