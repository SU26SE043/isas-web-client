export function CvAnalysisListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-satin bg-surface-raised p-5 motion-reduce:animate-none"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-40 rounded bg-surface-highlight" />
            <div className="h-4 w-16 rounded bg-surface-highlight" />
          </div>
          <div className="mt-3 h-3 w-56 rounded bg-surface-overlay" />
        </div>
      ))}
    </div>
  );
}

export function CvAnalysisDetailSkeleton() {
  return (
    <div className="space-y-4 border-t border-satin px-5 py-5 motion-reduce:animate-none" role="status">
      <div className="h-4 w-full max-w-xl animate-pulse rounded bg-surface-highlight" />
      <div className="h-4 w-5/6 max-w-lg animate-pulse rounded bg-surface-overlay" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 animate-pulse rounded-xl bg-surface-highlight" />
        <div className="h-32 animate-pulse rounded-xl bg-surface-highlight" />
      </div>
    </div>
  );
}
