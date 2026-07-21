import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const ProfileViewLoading: React.FC = () => (
  <div className="dashboard-content min-h-full space-y-4" aria-busy="true">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-10 w-40" />
    </div>
    <div className="rounded-xl border border-subtle bg-surface-raised p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Skeleton className="size-20 rounded-full sm:size-24" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-20 w-28" />
          <Skeleton className="h-20 w-28" />
        </div>
      </div>
    </div>
    <div className="rounded-xl border border-subtle bg-surface-raised p-6">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
    <div className="rounded-xl border border-subtle bg-surface-raised p-6">
      <Skeleton className="mb-4 h-5 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-52 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);
