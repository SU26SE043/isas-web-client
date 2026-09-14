import { useLanguage } from '@/shared/languages';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CampaignQuestionImportItem, CampaignQuestionImportResult } from '../../../types/campaign.api.types';

interface QuestionImportDialogProps {
  open: boolean;
  result: CampaignQuestionImportResult | null;
  accepted: CampaignQuestionImportItem[];
  skipped: number;
  error?: string | null;
  busy?: boolean;
  onClose: () => void;
  onPickAnother?: () => void;
  onConfirm: () => void;
}

const SAMPLE_CSV_HREF = 'data:text/csv;charset=utf-8,question_text%2Csample_answer%2Cis_required%2Cnhom%0A%22Tell%20us%20about%20a%20recent%20project.%22%2C%22%22%2Cfalse%2CTechnical%0A';

/**
 * Hộp thoại xem trước CSV. PHẢI đi qua `Dialog` (portal về `document.body`) như mọi hộp thoại
 * khác của wizard — bản trước tự vẽ `fixed inset-0` NGAY TRONG cây bước 4, mà `<section>` của
 * wizard mang `backdrop-blur-xl` ⇒ `backdrop-filter` biến section thành containing block của
 * `position: fixed` ⇒ lớp phủ phủ lên section 3.400px chứ không phải viewport, ô hộp thoại
 * căn giữa section nên nằm ngoài màn hình khi trang bước 4 dài và HR đã cuộn xuống nút
 * "Nhập CSV" ở cuối trang. Đo được trên dev: overlay top = −2.593px, người dùng chỉ thấy màn tối.
 */
export function QuestionImportDialog({
  open,
  result,
  accepted,
  skipped,
  error,
  busy = false,
  onClose,
  onPickAnother,
  onConfirm,
}: QuestionImportDialogProps) {
  const { t } = useLanguage();
  const itemErrors = result?.items.filter((item) => item.error).map((item) => ({ rowNumber: item.rowNumber, message: item.error! })) ?? [];
  const errors = [...(result?.errors ?? []), ...itemErrors];

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t('employer.campaigns.campaignQuestions.import.title')}</DialogTitle>
          {result ? (
            <DialogDescription>
              {t('employer.campaigns.campaignQuestions.import.rows').replace('{{total}}', String(result.totalRows)).replace('{{valid}}', String(accepted.length))}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        {error ? <p className="rounded-lg border border-error/40 bg-error-bg p-3 text-sm text-error" role="alert">{error}</p> : null}
        {errors.length ? (
          <div className="rounded-lg border border-error/40 bg-error-bg p-3 text-sm text-error">
            <p className="font-medium">{t('employer.campaigns.campaignQuestions.import.errors')}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {errors.map((item, index) => <li key={`${item.rowNumber}-${index}`}>{t('employer.campaigns.campaignQuestions.import.row').replace('{{row}}', String(item.rowNumber))}: {item.message}</li>)}
            </ul>
          </div>
        ) : null}
        {skipped > 0 ? <p className="rounded-lg border border-warning/40 bg-warning-bg p-3 text-sm text-warning">{t('employer.campaigns.campaignQuestions.import.skipped').replace('{{count}}', String(skipped))}</p> : null}
        <DialogFooter className="sm:justify-between">
          <a className="self-center text-sm text-foreground underline underline-offset-2" href={SAMPLE_CSV_HREF} download="campaign-questions-template.csv">
            {t('employer.campaigns.campaignQuestions.import.sample')}
          </a>
          <div className="flex flex-wrap gap-2">
            {onPickAnother ? <Button type="button" variant="outline" disabled={busy} onClick={onPickAnother}>{t('employer.campaigns.campaignQuestions.import.pickAnother')}</Button> : null}
            <Button type="button" variant="outline" disabled={busy} onClick={onClose}>{t('employer.campaigns.campaignQuestions.import.cancel')}</Button>
            <Button type="button" disabled={busy || accepted.length === 0} loading={busy} onClick={onConfirm}>
              {t('employer.campaigns.campaignQuestions.import.confirm').replace('{{count}}', String(accepted.length))}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
