import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileViewLoading: React.FC = () => (
  <div className="dashboard-content min-h-full space-y-4" aria-busy="true">
    <div className="overflow-hidden rounded-xl border border-subtle bg-surface-raised">
      <Skeleton className="h-24 w-full rounded-none sm:h-32" />
      <div className="space-y-4 px-5 pb-5 pt-0">
        <Skeleton className="-mt-12 size-24 rounded-full border-4 border-surface-raised sm:-mt-14 sm:size-28" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div className="order-2 space-y-4 lg:order-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-subtle bg-surface-raised p-5">
            <Skeleton className="mb-4 h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </div>
        ))}
      </div>
      <div className="order-1 lg:order-2">
        <div className="rounded-xl border border-subtle bg-surface-raised p-5">
          <Skeleton className="mb-3 h-4 w-40" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="mt-4 h-9 w-full" />
        </div>
      </div>
    </div>
  </div>
);
