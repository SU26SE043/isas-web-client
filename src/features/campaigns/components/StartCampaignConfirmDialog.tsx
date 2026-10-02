import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/shared/languages';
import { fillTemplate } from '../utils/campaignAttemptState';

interface StartCampaignConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  /** ATT1 [C6] — vắng (Backend cũ) ⇒ không có dòng thời lượng. */
  timeLimitMinutes?: number | null;
  /** ATT1 [C6] — vắng (Backend cũ) ⇒ không có dòng số lượt. */
  maxAttempts?: number;
  /** Chỉ truyền khi LÀM LẠI (③): số thứ tự lượt mới = attemptsUsed + 1. */
  retryAttemptNo?: number;
  /** [C8] đã nhận ATTEMPT_LIMIT_REACHED ⇒ khoá nút xác nhận (Huỷ vẫn dùng được). */
  confirmDisabled?: boolean;
}

function useAttemptRuleLines(
  timeLimitMinutes: number | null | undefined,
  maxAttempts: number | undefined,
  retryAttemptNo: number | undefined,
): string[] {
  const { t } = useLanguage();
  const lines: string[] = [];
  const hasDuration = typeof timeLimitMinutes === 'number';
  if (hasDuration) {
    lines.push(fillTemplate(t('campaigns.detail.confirm.duration'), { n: timeLimitMinutes }));
  }
  if (typeof maxAttempts === 'number') {
    const attempts = fillTemplate(
      t(maxAttempts === 1 ? 'campaigns.detail.confirm.attemptsOne' : 'campaigns.detail.confirm.attemptsMany'),
      { n: maxAttempts },
    );
    lines.push(hasDuration ? `${attempts} ${t('campaigns.detail.confirm.resumeRule')}` : attempts);
    if (typeof retryAttemptNo === 'number') {
      lines.push(fillTemplate(t('campaigns.detail.confirm.retryLine'), { n: retryAttemptNo, max: maxAttempts }));
    }
  }
  return lines;
}

export function StartCampaignConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting = false,
  errorMessage = null,
  timeLimitMinutes,
  maxAttempts,
  retryAttemptNo,
  confirmDisabled = false,
}: StartCampaignConfirmDialogProps) {
  const { t } = useLanguage();
  const ruleLines = useAttemptRuleLines(timeLimitMinutes, maxAttempts, retryAttemptNo);
  // Field vắng (Backend cũ) ⇒ nội dung y như trước ATT1, kể cả nhãn nút.
  const confirmLabel = ruleLines.length > 0
    ? t('campaigns.detail.confirm.goToPrepare')
    : t('campaigns.detail.startConfirm');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('campaigns.detail.startConfirmTitle')}</DialogTitle>
          <DialogDescription>{t('campaigns.detail.startConfirmBody')}</DialogDescription>
        </DialogHeader>
        {ruleLines.length > 0 ? (
          <ul data-testid="start-confirm-rules" className="space-y-2 text-sm text-foreground">
            {ruleLines.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-current" aria-hidden />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {errorMessage ? (
          <p className="text-sm text-error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('campaigns.detail.startCancel')}
          </Button>
          <button
            type="button"
            className="btn-primary inline-flex"
            disabled={isSubmitting || confirmDisabled}
            onClick={onConfirm}
          >
            {isSubmitting ? t('campaigns.detail.starting') : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
