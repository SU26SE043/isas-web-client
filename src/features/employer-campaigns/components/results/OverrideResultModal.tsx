import { useEffect, useId, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { useOverrideCampaignResult } from '../../hooks/useCampaignResults';
import type { CampaignResultItem } from '../../types/campaign.api.types';
import {
  formatResultScore,
  getOverrideErrorMessage,
  parseOverrideScoreInput,
  toOverrideResultPayload,
  type OverrideResultChoice,
} from '../../utils/campaignResultsActions';
import { candidateDisplayName } from './ResultBadges';

interface OverrideResultModalProps {
  open: boolean;
  campaignId: string;
  item: CampaignResultItem | null;
  onClose: () => void;
}

export function OverrideResultModal({
  open,
  campaignId,
  item,
  onClose,
}: OverrideResultModalProps) {
  const { t } = useLanguage();
  const mutation = useOverrideCampaignResult(campaignId);
  const [scoreInput, setScoreInput] = useState('');
  const [resultChoice, setResultChoice] = useState<OverrideResultChoice>('keep');
  const [note, setNote] = useState('');
  const [scoreError, setScoreError] = useState(false);
  const noteId = useId();
  const scoreErrorId = useId();

  useEffect(() => {
    if (!open || !item) return;
    setScoreInput(item.overrideScore != null ? String(item.overrideScore) : '');
    setResultChoice(item.overrideResult ?? 'keep');
    setNote(item.overrideNote ?? '');
    setScoreError(false);
  }, [open, item]);

  const parsed = parseOverrideScoreInput(scoreInput);
  const noteValid = note.trim().length > 0;
  const canSubmit = Boolean(item) && noteValid && !parsed.error && !mutation.isPending;

  const handleSubmit = async () => {
    if (!item || !canSubmit) return;
    if (parsed.error) {
      setScoreError(true);
      return;
    }
    setScoreError(false);
    try {
      await mutation.mutateAsync({
        sessionId: item.sessionId,
        payload: {
          score: parsed.score,
          result: toOverrideResultPayload(resultChoice),
          note: note.trim(),
        },
      });
      toast.success(t('employer.campaigns.results.override.success'));
      onClose();
    } catch (error) {
      const mapped = getOverrideErrorMessage(
        error,
        t('employer.campaigns.results.errors.overrideBadRequest'),
      );
      toast.error(mapped.startsWith('employer.') ? t(mapped) : mapped);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.results.override.title')}</DialogTitle>
          <DialogDescription>{t('employer.campaigns.results.override.description')}</DialogDescription>
        </DialogHeader>

        {item ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-satin bg-surface-overlay px-3 py-3 text-sm">
              <p className="font-medium text-foreground">{candidateDisplayName(item, t)}</p>
              <p className="mt-1 text-muted-foreground">
                {t('employer.campaigns.results.aiScore')}: {formatResultScore(item.aiScore)}
              </p>
              <p className="text-muted-foreground">
                {t('employer.campaigns.results.columns.totalScore')}:{' '}
                {formatResultScore(item.totalScore)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="override-score">{t('employer.campaigns.results.override.score')}</Label>
              <Input
                id="override-score"
                inputMode="decimal"
                value={scoreInput}
                onChange={(event) => setScoreInput(event.target.value)}
                placeholder={t('employer.campaigns.results.override.scorePlaceholder')}
                aria-invalid={scoreError || parsed.error}
                aria-describedby={scoreError || parsed.error ? scoreErrorId : undefined}
              />
              {scoreError || parsed.error ? (
                <p id={scoreErrorId} className="text-xs text-destructive">
                  {t('employer.campaigns.results.override.scoreInvalid')}
                </p>
              ) : null}
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">
                {t('employer.campaigns.results.override.result')}
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    ['keep', 'employer.campaigns.results.override.keepResult'],
                    ['Pass', 'employer.campaigns.results.pass'],
                    ['Fail', 'employer.campaigns.results.fail'],
                  ] as const
                ).map(([value, key]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setResultChoice(value)}
                    className={
                      resultChoice === value
                        ? 'rounded-lg border border-satin bg-white/[0.08] px-3 py-2 text-sm text-foreground'
                        : 'rounded-lg border border-subtle px-3 py-2 text-sm text-muted-foreground hover:bg-white/[0.04]'
                    }
                  >
                    {t(key)}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor={noteId}>{t('employer.campaigns.results.override.note')}</Label>
              <textarea
                id={noteId}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder={t('employer.campaigns.results.override.notePlaceholder')}
                className="w-full rounded-lg border border-satin bg-surface-overlay px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-invalid={!noteValid && note.length > 0}
              />
              {!noteValid ? (
                <p className="text-xs text-destructive">
                  {t('employer.campaigns.results.override.noteRequired')}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t('employer.campaigns.results.override.cancel')}
          </Button>
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {mutation.isPending
              ? t('employer.campaigns.results.override.saving')
              : t('employer.campaigns.results.override.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
