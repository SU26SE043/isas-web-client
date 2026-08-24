import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RoadmapThreshold } from '../../types/adminApi.types';

/** Ngưỡng hợp lệ = số hữu hạn trong [0,100]. Chuỗi rỗng KHÔNG hợp lệ (khác với 0). */
export function isValidThresholdPct(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 && value <= 100;
}

interface RoadmapThresholdsTableProps {
  rows: RoadmapThreshold[];
  draft: Record<string, string>;
  resettingLevel: string | null;
  onDraftChange: (level: string, value: string) => void;
  onReset: (level: string) => void;
}

export function RoadmapThresholdsTable({ rows, draft, resettingLevel, onDraftChange, onReset }: RoadmapThresholdsTableProps) {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto rounded-xl border border-satin bg-surface-overlay/50">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="border-b border-white/10 bg-white/[0.04]">
          <tr>
            {['level', 'effective', 'default', 'state', 'updated', 'actions'].map((column) => (
              <th key={column} className="p-3 text-left text-xs uppercase text-foreground">{t(`admin.roadmapThresholds.column.${column}`)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const value = draft[row.level] ?? String(row.effectivePct);
            const invalid = !isValidThresholdPct(value);
            return (
              <tr key={row.level} className="border-b border-white/5 align-top">
                <th className="p-3 text-left font-medium text-foreground">
                  <span className="flex flex-wrap items-center gap-2">
                    {row.level}
                    {/* Hàng mồ côi phải HIỆN ra để admin dọn, không giấu đi. */}
                    {row.isKnownLevel ? null : (
                      <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">{t('admin.roadmapThresholds.unknownLevel')}</Badge>
                    )}
                  </span>
                  {row.isKnownLevel ? null : <p className="mt-1 text-xs font-normal text-muted-foreground">{t('admin.roadmapThresholds.unknownLevelHint')}</p>}
                </th>
                <td className="p-2">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    aria-label={`${t('admin.roadmapThresholds.column.effective')} ${row.level}`}
                    aria-invalid={invalid || undefined}
                    disabled={!row.isKnownLevel}
                    value={value}
                    onChange={(event) => onDraftChange(row.level, event.target.value)}
                    className={cn('w-28', invalid && 'border-error')}
                  />
                  {invalid ? <p className="mt-1 text-xs text-error">{t('admin.roadmapThresholds.invalidPct')}</p> : null}
                </td>
                <td className="p-3 text-muted-foreground">{row.defaultPct}%</td>
                <td className="p-3">
                  {/* `isOverridden` ĐỌC TỪ SERVER — không suy từ effective !== default. */}
                  <Badge variant="outline" className={row.isOverridden ? 'border-info/30 bg-info/10 text-info' : 'border-subtle bg-surface-overlay text-muted-foreground'}>
                    {t(row.isOverridden ? 'admin.roadmapThresholds.overridden' : 'admin.roadmapThresholds.usingDefault')}
                  </Badge>
                </td>
                <td className="p-3 text-xs text-muted-foreground">
                  {row.isOverridden && (row.updatedBy || row.updatedAt)
                    ? <>{row.updatedBy ?? t('admin.roadmapThresholds.unknownActor')}{row.updatedAt ? <span className="block">{row.updatedAt}</span> : null}</>
                    : <span>{t('admin.roadmapThresholds.noUpdate')}</span>}
                </td>
                <td className="p-3">
                  {row.isOverridden ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={resettingLevel === row.level}
                      aria-label={`${t('admin.roadmapThresholds.reset')} ${row.level}`}
                      onClick={() => onReset(row.level)}
                    >
                      {t('admin.roadmapThresholds.reset')}
                    </Button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
