import { CheckCircle2, TriangleAlert, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RubricPreviewRun, RubricPreviewVerdict } from '../../../types/rubricPreview.types';
import { formatPct } from './formatPct';

/** Kết luận + chẩn đoán + ngưỡng + bài đối chứng — khối HR phải đọc ĐẦU TIÊN (trên 3 thẻ điểm, trên hàng nút). */
const TONE: Record<RubricPreviewVerdict['verdict'], { box: string; Icon: typeof CheckCircle2 }> = {
  discriminates: { box: 'border-success/30 bg-success/5 text-success', Icon: CheckCircle2 },
  inconclusive: { box: 'border-warning/30 bg-warning/5 text-warning', Icon: TriangleAlert },
  weak: { box: 'border-error/30 bg-error/5 text-error', Icon: XCircle },
};

/** Bài tự dán nằm ở đâu so với 3 bài AI: dưới Yếu · giữa Yếu–Khá · giữa Khá–Xuất sắc · trên Xuất sắc. */
export function customPosition(run: RubricPreviewRun): { key: string; pct: number; low?: number; high?: number } | null {
  const custom = run.samples.find((sample) => sample.band === 'Custom');
  if (!custom) return null;
  const pct = (band: string) => run.samples.find((sample) => sample.band === band)?.actualWeightedPct;
  const weak = pct('Weak');
  const good = pct('Good');
  const excellent = pct('Excellent');
  const value = custom.actualWeightedPct;
  if (weak != null && value < weak) return { key: 'belowWeak', pct: value, low: weak };
  if (excellent != null && value > excellent) return { key: 'aboveExcellent', pct: value, high: excellent };
  if (weak != null && good != null && value <= good) return { key: 'betweenWeakGood', pct: value, low: weak, high: good };
  if (good != null && excellent != null) return { key: 'betweenGoodExcellent', pct: value, low: good, high: excellent };
  return null;
}

export function RubricPreviewVerdictBlock({ run, verdict }: { run: RubricPreviewRun; verdict: RubricPreviewVerdict }) {
  const { t } = useLanguage();
  const K = 'employer.campaigns.rubricPreview';
  const bandLabel = (band: RubricPreviewRun['samples'][number]['band']) => t(`${K}.band.${band}`);
  const { box, Icon } = TONE[verdict.verdict];
  const custom = customPosition(run);
  const fmt = (value: number | undefined) => (value == null ? '' : `${formatPct(value)}%`);

  return (
    <div className="space-y-2 text-sm">
      <p className={cn('flex items-start gap-2 rounded-lg border px-3 py-2 text-base font-semibold', box)} data-testid="preview-verdict">
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
        <span>{t(`${K}.verdict.${verdict.verdict}`).replace('{{range}}', formatPct(verdict.range))}</span>
      </p>
      {verdict.compression ? (
        <p className="text-foreground" data-testid="preview-compression">
          {t(`${K}.compression`)
            .replace('{{weakOver}}', String(verdict.compression.weakOver))
            .replace('{{excellentUnder}}', String(verdict.compression.excellentUnder))
            .replace(/\{\{total\}\}/g, String(verdict.compression.total))}
        </p>
      ) : null}
      {verdict.bias !== 'none' ? <p className="text-muted-foreground">{t(`${K}.bias.${verdict.bias}`)}</p> : null}
      {verdict.threshold ? (
        <p className="text-muted-foreground">
          {verdict.threshold.failing.length
            ? t(`${K}.threshold.failing`).replace('{{pct}}', String(verdict.threshold.pct)).replace('{{bands}}', verdict.threshold.failing.map(bandLabel).join(' · '))
            : t(`${K}.threshold.allPass`).replace('{{pct}}', String(verdict.threshold.pct))}
        </p>
      ) : null}
      {custom ? (
        <p className="text-foreground" data-testid="preview-custom-position">
          {t(`${K}.custom.${custom.key}`).replace('{{pct}}', fmt(custom.pct)).replace('{{low}}', fmt(custom.low)).replace('{{high}}', fmt(custom.high))}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">{t(`${K}.result.expectedHint`)}</p>
      <p className="text-xs text-muted-foreground">{t(`${K}.result.footnote`)}</p>
    </div>
  );
}
