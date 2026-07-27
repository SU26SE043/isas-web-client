import { Skeleton } from '@/components/ui/skeleton';

export function PracticeResultSkeleton() {
  return (
    <div className="page-container page-section mx-auto max-w-7xl space-y-8 py-8">
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-9 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-6 rounded-2xl border border-satin p-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-44" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
      {[0, 1].map((item) => (
        <div key={item} className="space-y-4 rounded-2xl border border-satin p-6">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ))}
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );
}
