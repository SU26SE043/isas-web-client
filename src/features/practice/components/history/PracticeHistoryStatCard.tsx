export function PracticeHistoryStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-satin bg-surface-overlay px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
