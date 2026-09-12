import * as React from 'react';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import type { RubricPreviewRun, RubricPreviewSample, RubricPreviewSampleScore } from '../../../types/rubricPreview.types';

/**
 * Ô "lệch ≥ 1 mức": bộ chấm chọn mốc khác mốc code kỳ vọng. So theo MỐC (levelMatched) chứ không theo điểm,
 * vì mốc không cách đều (0/2/4/5) — chênh 1 điểm có thể là cùng mốc hoặc khác mốc. Không có mốc thì so điểm.
 */
export function isOffExpected(score: RubricPreviewSampleScore, band: RubricPreviewSample['band']): boolean {
  if (band === 'Custom') return false;
  if (score.levelMatched != null) return score.levelMatched !== score.expectedLevel;
  return Math.abs(score.actualScore - score.expectedLevel) >= 1;
}

type Focus = { kind: 'reasoning'; sample: RubricPreviewSample; score: RubricPreviewSampleScore } | { kind: 'answer'; sample: RubricPreviewSample };

export function RubricPreviewResultTable({ run }: { run: RubricPreviewRun }) {
  const { t } = useLanguage();
  const [focus, setFocus] = React.useState<Focus | null>(null);
  const bandLabel = (band: RubricPreviewSample['band']) => t(`employer.campaigns.rubricPreview.band.${band}`);
  const criteria = run.rubric.length
    ? run.rubric.map((item) => ({ id: item.criterionId, name: item.name, maxScore: item.maxScore }))
    : (run.samples[0]?.scores ?? []).map((score) => ({ id: score.criterionId, name: score.criterionName, maxScore: score.maxScore }));

  return (
    <>
      <Table className="min-w-[36rem]">
        <TableHeader>
          <TableRow>
            <TableHead>{t('employer.campaigns.rubricPreview.details.criterion')}</TableHead>
            {run.samples.map((sample) => (
              <TableHead key={sample.band} className="text-center">
                <button
                  type="button"
                  className="underline underline-offset-4 hover:text-foreground"
                  aria-label={`${t('employer.campaigns.rubricPreview.details.openAnswer')}: ${bandLabel(sample.band)}`}
                  onClick={() => setFocus({ kind: 'answer', sample })}
                >
                  {bandLabel(sample.band)}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {criteria.map((criterion) => (
            <TableRow key={criterion.id}>
              <TableCell className="font-medium text-foreground">{criterion.name}</TableCell>
              {run.samples.map((sample) => {
                const score = sample.scores.find((item) => item.criterionId === criterion.id);
                if (!score) return <TableCell key={sample.band} className="text-center">—</TableCell>;
                const off = isOffExpected(score, sample.band);
                return (
                  <TableCell key={sample.band} className="text-center">
                    <button
                      type="button"
                      className={cn('inline-flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 hover:bg-surface-highlight', off && 'text-warning')}
                      aria-label={`${t('employer.campaigns.rubricPreview.details.openReasoning')}: ${criterion.name} · ${bandLabel(sample.band)}`}
                      title={off ? t('employer.campaigns.rubricPreview.details.offExpected') : undefined}
                      onClick={() => setFocus({ kind: 'reasoning', sample, score })}
                    >
                      <span className={cn('inline-flex items-center gap-1 font-semibold tabular-nums', off ? 'text-warning' : 'text-foreground')}>
                        {off ? <TriangleAlert className="size-3.5" aria-hidden /> : null}
                        {score.actualScore}/{score.maxScore}
                      </span>
                      {sample.band !== 'Custom' ? (
                        <span className="text-xs text-muted-foreground">
                          {t('employer.campaigns.rubricPreview.details.expectedLevel').replace('{{level}}', String(score.expectedLevel))}
                        </span>
                      ) : null}
                    </button>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={focus != null} onOpenChange={(open) => (open ? undefined : setFocus(null))}>
        <DialogContent showCloseButton={false}>
          {focus?.kind === 'reasoning' ? (
            <>
              <DialogHeader>
                <DialogTitle>{t('employer.campaigns.rubricPreview.details.reasoning')}</DialogTitle>
                <DialogDescription>
                  {focus.score.criterionName} · {bandLabel(focus.sample.band)} · {focus.score.actualScore}/{focus.score.maxScore}
                </DialogDescription>
              </DialogHeader>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {focus.score.reasoning?.trim() || t('employer.campaigns.rubricPreview.details.noReasoning')}
              </p>
            </>
          ) : null}
          {focus?.kind === 'answer' ? (
            <>
              <DialogHeader>
                <DialogTitle>
                  {t('employer.campaigns.rubricPreview.details.answer')} · {bandLabel(focus.sample.band)}
                </DialogTitle>
                <DialogDescription>{t('employer.campaigns.rubricPreview.details.wordCount').replace('{{n}}', String(focus.sample.wordCount))}</DialogDescription>
              </DialogHeader>
              <p className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed text-foreground">{focus.sample.answerText}</p>
            </>
          ) : null}
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => setFocus(null)}>
              {t('employer.campaigns.rubricPreview.details.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
