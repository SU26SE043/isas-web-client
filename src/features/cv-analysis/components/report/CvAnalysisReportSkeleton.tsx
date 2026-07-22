export function CvAnalysisListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 motion-reduce:animate-none"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="h-4 w-40 rounded bg-zinc-800" />
            <div className="h-4 w-16 rounded bg-zinc-800" />
          </div>
          <div className="mt-3 h-3 w-56 rounded bg-zinc-800/80" />
        </div>
      ))}
    </div>
  );
}

export function CvAnalysisDetailSkeleton() {
  return (
    <div className="space-y-4 border-t border-zinc-800 px-5 py-5 motion-reduce:animate-none" role="status">
      <div className="h-4 w-full max-w-xl animate-pulse rounded bg-zinc-800" />
      <div className="h-4 w-5/6 max-w-lg animate-pulse rounded bg-zinc-800/80" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-32 animate-pulse rounded-xl bg-zinc-800/60" />
        <div className="h-32 animate-pulse rounded-xl bg-zinc-800/60" />
      </div>
    </div>
  );
}
