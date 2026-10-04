import {
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  Database,
  FileText,
  FolderOpen,
  HelpCircle,
  ListOrdered,
} from 'lucide-react';

const SUMMARY_ICONS = [BriefcaseBusiness, FileText, FolderOpen, ListOrdered, Clock3, BarChart3, HelpCircle, Database];

export function PracticeSummaryInfoRows({ rows }: { rows: Array<{ label: string; value: string }> }) {
  return (
    <dl className="divide-y divide-satin/70 rounded-xl border border-satin/70 bg-surface-overlay/55 px-3">
      {rows.map((row, index) => {
        const Icon = SUMMARY_ICONS[index] ?? HelpCircle;
        return (
          <div key={row.label} className="flex items-center gap-3 py-2.5 text-sm">
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <dt className="min-w-0 flex-1 text-muted-foreground">{row.label}</dt>
            <dd className="max-w-[62%] text-right font-medium text-foreground">{row.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
