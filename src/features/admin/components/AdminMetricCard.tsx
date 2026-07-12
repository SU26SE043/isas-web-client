import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AdminStatusBadge } from './AdminStatusBadge';
import type { AdminStatus } from '../types/admin.types';

interface AdminMetricCardProps {
  label: string;
  value: string | number;
  hint: string;
  status: AdminStatus;
  icon: ReactNode;
}

export function AdminMetricCard({ label, value, hint, status, icon }: AdminMetricCardProps) {
  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-subtle bg-surface-overlay text-muted-foreground">
            {icon}
          </div>
          <AdminStatusBadge status={status} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
