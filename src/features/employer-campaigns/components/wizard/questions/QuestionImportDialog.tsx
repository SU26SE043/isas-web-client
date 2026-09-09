import { useLanguage } from '@/shared/languages';
import { Button } from '@/components/ui/button';
import type { CampaignQuestionImportItem, CampaignQuestionImportResult } from '../../../types/campaign.api.types';

interface QuestionImportDialogProps {
  open: boolean;
  result: CampaignQuestionImportResult | null;
  accepted: CampaignQuestionImportItem[];
  skipped: number;
  error?: string | null;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function QuestionImportDialog({
  open,
  result,
  accepted,
  skipped,
  error,
  busy = false,
  onClose,
  onConfirm,
}: QuestionImportDialogProps) {
  const { t } = useLanguage();
  if (!open) return null;
  const itemErrors = result?.items.filter((item) => item.error).map((item) => ({ rowNumber: item.rowNumber, message: item.error! })) ?? [];
  const errors = [...(result?.errors ?? []), ...itemErrors];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="question-import-title">
      <div className="frame-satin max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface-raised p-5 shadow-[var(--shadow-lg)]">
        <h2 id="question-import-title" className="text-lg font-semibold text-foreground">
          {t('employer.campaigns.campaignQuestions.import.title')}
        </h2>
        {error ? <p className="mt-3 rounded-lg border border-error/40 bg-error-bg p-3 text-sm text-error" role="alert">{error}</p> : null}
        {result ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-foreground">
              {t('employer.campaigns.campaignQuestions.import.rows').replace('{{total}}', String(result.totalRows)).replace('{{valid}}', String(accepted.length))}
            </p>
            {errors.length ? (
              <div className="rounded-lg border border-error/40 bg-error-bg p-3 text-sm text-error">
                <p className="font-medium">{t('employer.campaigns.campaignQuestions.import.errors')}</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {errors.map((item, index) => <li key={`${item.rowNumber}-${index}`}>{t('employer.campaigns.campaignQuestions.import.row').replace('{{row}}', String(item.rowNumber))}: {item.message}</li>)}
                </ul>
              </div>
            ) : null}
            {skipped > 0 ? <p className="rounded-lg border border-warning/40 bg-warning-bg p-3 text-sm text-warning">{t('employer.campaigns.campaignQuestions.import.skipped').replace('{{count}}', String(skipped))}</p> : null}
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <a className="text-sm text-foreground underline underline-offset-2" href="data:text/csv;charset=utf-8,question_text%2Csample_answer%2Cis_required%2Cnhom%0A%22Tell%20us%20about%20a%20recent%20project.%22%2C%22%22%2Cfalse%2CTechnical%0A" download="campaign-questions-template.csv">
            {t('employer.campaigns.campaignQuestions.import.sample')}
          </a>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t('employer.campaigns.campaignQuestions.import.cancel')}</Button>
            <Button type="button" disabled={busy || accepted.length === 0} loading={busy} onClick={onConfirm}>
              {t('employer.campaigns.campaignQuestions.import.confirm').replace('{{count}}', String(accepted.length))}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
