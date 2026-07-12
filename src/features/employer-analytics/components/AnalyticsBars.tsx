import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BarItem {
  label: string;
  value: number;
  hint?: string;
}

interface AnalyticsBarsProps {
  title: string;
  items: BarItem[];
  max?: number;
}

export function AnalyticsBars({ title, items, max }: AnalyticsBarsProps) {
  const largest = max ?? Math.max(...items.map((item) => item.value), 1);

  return (
    <Card className="border border-subtle bg-surface-raised">
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground">{item.value}{item.hint ? ` ${item.hint}` : ''}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-overlay" role="presentation">
              <div className="h-full rounded-full bg-info" style={{ width: `${Math.max(4, (item.value / largest) * 100)}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
