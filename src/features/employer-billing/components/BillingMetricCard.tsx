import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface BillingMetricCardProps {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
}

export function BillingMetricCard({ label, value, hint, icon }: BillingMetricCardProps) {
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-subtle bg-surface-overlay text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
