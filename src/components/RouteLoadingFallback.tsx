export function RouteLoadingFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center surface-base" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" aria-hidden="true" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}
