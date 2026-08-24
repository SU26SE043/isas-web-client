import { Check, X } from 'lucide-react';
import type { RoadmapLevelEvaluationItem } from '../types/roadmapPractice.api.types';

export function LevelEvaluationRow({
  item,
  t,
}: {
  item: RoadmapLevelEvaluationItem;
  t: (key: string) => string;
}) {
  const pct = Math.max(0, Math.min(100, item.percentage));
  const threshold = Math.max(0, Math.min(100, item.levelThreshold));
  return (
    <li className="rounded-lg border border-subtle bg-surface-overlay p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{item.criterionName}</p>
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium ${
            item.passed ? 'text-success' : 'text-warning'
          }`}
        >
          {item.passed ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
          {item.passed
            ? t('practice.learningPath.levelEvaluationPassed')
            : t('practice.learningPath.levelEvaluationFailed')}
        </span>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>{pct}%</span>
        <span>
          {t('practice.learningPath.levelThreshold')}: {threshold}%
        </span>
      </div>
      <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-surface-base">
        <div
          className={`h-full rounded-full ${item.passed ? 'bg-success' : 'bg-warning'}`}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/60"
          style={{ left: `${threshold}%` }}
          aria-hidden
        />
      </div>
    </li>
  );
}

export function ListBlock({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText?: string;
}) {
  return (
    <div className="rounded-xl border border-subtle bg-surface-raised p-5">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">{emptyText ?? '—'}</p>
      ) : (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
