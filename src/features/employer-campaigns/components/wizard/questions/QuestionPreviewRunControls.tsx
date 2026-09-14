import * as React from 'react';
import { FlaskConical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';

export interface QuestionPreviewRunControlsProps {
  questionId: string;
  /** Bài tự dán mặc định = câu trả lời mẫu của chính câu này (HR sửa được, để trống = chỉ 3 bài AI). */
  sampleAnswer: string;
  /** Wizard có bước lưu ⇒ nhãn "Lưu & chấm thử"; trang chi tiết ⇒ "Chấm thử". */
  savesBeforeRun: boolean;
  /** Campaign đang mở + có bước lưu ⇒ hỏi trước: lưu tạo bản thước đo mới cho ứng viên thi sau. */
  requireConfirm: boolean;
  currentRubricVersion: number | null;
  /**
   * Quota THEO CÂU (D-4: 1 lượt miễn phí / câu / bản thước đo). `null` = KHÔNG BIẾT (lịch sử đang tải / cửa sổ
   * 20 lượt đầy) ⇒ HỎI trước khi chạy như ca hết lượt (R3a) — không đoán "còn 1" rồi trừ credit im lặng.
   */
  freeRunsLeft: number | null;
  /** R3(c) — BE 409 PREVIEW_BILLING_CONFIRM_REQUIRED cho lượt vừa bấm ⇒ mở hộp thoại; đồng ý ⇒ gọi lại có cờ. */
  billingConfirmPending?: boolean;
  onCancelBillingConfirm?: () => void;
  disabled: boolean;
  isRunning: boolean;
  /** `confirmBilled` = HR đã đồng ý trừ credit (hộp thoại trả phí / không rõ quota / BE đòi xác nhận). */
  onRun: (customAnswer: string | null, confirmBilled: boolean) => void;
}

/**
 * SC2 · T9 — ô bài tự dán + nút chấm thử + hộp thoại xác nhận (I7: hết lượt miễn phí ⇒ HỎI trước khi trừ credit,
 * không trừ trong im lặng). Tách khỏi panel để mỗi file ≤ 250 dòng; KHÔNG có `<select>` câu hỏi — câu là
 * chính card đang đứng.
 */
export function QuestionPreviewRunControls({
  questionId,
  sampleAnswer,
  savesBeforeRun,
  requireConfirm,
  currentRubricVersion,
  freeRunsLeft,
  billingConfirmPending = false,
  onCancelBillingConfirm,
  disabled,
  isRunning,
  onRun,
}: QuestionPreviewRunControlsProps) {
  const { t } = useLanguage();
  // `null` = chưa chạm ⇒ bám theo câu mẫu (HR sửa câu mẫu thì ô này đổi theo); chuỗi = HR đã tự sửa.
  const [customEdited, setCustomEdited] = React.useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const customValue = customEdited ?? sampleAnswer;
  const paid = freeRunsLeft != null && freeRunsLeft <= 0;
  const unknown = freeRunsLeft == null;
  // Hộp thoại ở chế độ "trừ credit" khi: FE biết đã hết lượt · FE không biết · BE vừa từ chối vì chưa xác nhận.
  const charge = paid || unknown || billingConfirmPending;
  const dialogOpen = confirmOpen || billingConfirmPending;

  const fire = (confirmBilled: boolean) => onRun(customValue.trim() ? customValue.trim() : null, confirmBilled);
  const submit = () => {
    if (requireConfirm || paid || unknown) {
      setConfirmOpen(true);
      return;
    }
    fire(false);
  };
  const closeDialog = () => {
    setConfirmOpen(false);
    if (billingConfirmPending) onCancelBillingConfirm?.();
  };

  const baseLabel = savesBeforeRun ? t('employer.campaigns.rubricPreview.runSave') : t('employer.campaigns.rubricPreview.run');
  const runLabel = paid ? t('employer.campaigns.rubricPreview.runPaid').replace('{{label}}', baseLabel) : baseLabel;
  const versionSentence = currentRubricVersion != null
    ? t('employer.campaigns.rubricPreview.confirm.description').replace('{{next}}', String(currentRubricVersion + 1)).replace('{{current}}', String(currentRubricVersion))
    : t('employer.campaigns.rubricPreview.confirm.descriptionUnknown');
  const chargeSentence = paid || billingConfirmPending
    ? t('employer.campaigns.questionCard.preview.confirm.paidDescription')
    : unknown ? t('employer.campaigns.questionCard.preview.confirm.unknownDescription') : null;
  const confirmDescription = [chargeSentence, requireConfirm ? versionSentence : null].filter(Boolean).join(' ');
  const dialogTitle = paid || billingConfirmPending
    ? t('employer.campaigns.rubricPreview.confirm.paidTitle')
    : unknown ? t('employer.campaigns.rubricPreview.confirm.maybePaidTitle') : t('employer.campaigns.rubricPreview.confirm.title');

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`q-custom-${questionId}`}>{t('employer.campaigns.questionCard.preview.custom.label')}</Label>
        <Textarea
          id={`q-custom-${questionId}`}
          rows={4}
          value={customValue}
          disabled={disabled || isRunning}
          placeholder={t('employer.campaigns.rubricPreview.custom.placeholder')}
          onChange={(event) => setCustomEdited(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">{t('employer.campaigns.questionCard.preview.custom.hint')}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={disabled || isRunning} loading={isRunning} onClick={submit}>
          {!isRunning ? <FlaskConical className="size-3.5" aria-hidden /> : null}
          {isRunning ? t('employer.campaigns.rubricPreview.running') : runLabel}
        </Button>
        {freeRunsLeft != null ? (
          <Badge variant={paid ? 'info' : 'success'} data-testid="question-preview-quota">
            {paid
              ? t('employer.campaigns.questionCard.preview.quota.paid')
              : t('employer.campaigns.questionCard.preview.quota.free').replace('{{n}}', String(freeRunsLeft))}
          </Badge>
        ) : null}
      </div>
      {paid ? <p className="text-xs text-muted-foreground">{t('employer.campaigns.questionCard.preview.quota.hint')}</p> : null}

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={(open) => { if (!open) closeDialog(); }}
        title={dialogTitle}
        description={confirmDescription}
        confirmLabel={paid || billingConfirmPending ? t('employer.campaigns.rubricPreview.runPaid').replace('{{label}}', baseLabel) : baseLabel}
        cancelLabel={t('employer.campaigns.rubricPreview.confirm.cancel')}
        onConfirm={() => {
          closeDialog();
          // Đồng ý ở chế độ trừ credit ⇒ gửi cờ; chỉ xác nhận bản thước đo (còn lượt miễn phí) ⇒ không.
          fire(charge);
        }}
      />
    </div>
  );
}
