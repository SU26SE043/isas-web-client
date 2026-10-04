import * as React from 'react';
import { FileText, FlaskConical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { useLanguage } from '@/shared/languages';

export interface QuestionPreviewRunControlsProps {
  questionId: string;
  /** Câu trả lời mẫu của chính câu này — chỉ để nút "Dùng câu trả lời mẫu" chép vào ô (ô mặc định TRỐNG). */
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
  onRun: (customAnswer: string, confirmBilled: boolean) => void;
}

/**
 * SC2 · T9 — ô câu trả lời + nút chấm thử + hộp thoại xác nhận (I7: hết lượt miễn phí ⇒ HỎI trước khi trừ credit,
 * không trừ trong im lặng). 2026-10-03: chấm thử CHỈ chấm câu trả lời người dùng tự nhập ⇒ ô mặc định TRỐNG,
 * chưa nhập thì nút tắt (BE cũng 400). Tách khỏi panel để mỗi file ≤ 250 dòng.
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
  const [answer, setAnswer] = React.useState('');
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const trimmed = answer.trim();
  const paid = freeRunsLeft != null && freeRunsLeft <= 0;
  const unknown = freeRunsLeft == null;
  // Hộp thoại ở chế độ "trừ credit" khi: FE biết đã hết lượt · FE không biết · BE vừa từ chối vì chưa xác nhận.
  const charge = paid || unknown || billingConfirmPending;
  const dialogOpen = confirmOpen || billingConfirmPending;

  const fire = (confirmBilled: boolean) => {
    // Hộp thoại trả phí có thể TỰ mở (BE 409) — ô trống thì không gửi gì: BE sẽ 400, không còn bài để chấm.
    if (trimmed) onRun(trimmed, confirmBilled);
  };
  const submit = () => {
    if (!trimmed) return;
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label htmlFor={`q-custom-${questionId}`}>{t('employer.campaigns.questionCard.preview.custom.label')}</Label>
          {sampleAnswer.trim() ? (
            <Button type="button" variant="ghost" size="sm" disabled={disabled || isRunning} onClick={() => setAnswer(sampleAnswer)}>
              <FileText className="size-3.5" aria-hidden />
              {t('employer.campaigns.questionCard.preview.custom.useSample')}
            </Button>
          ) : null}
        </div>
        <Textarea
          id={`q-custom-${questionId}`}
          rows={4}
          value={answer}
          disabled={disabled || isRunning}
          placeholder={t('employer.campaigns.rubricPreview.custom.placeholder')}
          onChange={(event) => setAnswer(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="default" className="h-auto min-h-8 max-w-full shrink whitespace-normal py-1.5 text-left" disabled={disabled || isRunning || !trimmed} loading={isRunning} onClick={submit}>
          {!isRunning ? <FlaskConical className="size-3.5" aria-hidden /> : null}
          {isRunning ? t('employer.campaigns.rubricPreview.running') : runLabel}
        </Button>
        {/* Giá chỉ nói MỘT lần: còn lượt miễn phí ⇒ badge; hết ⇒ nút đã ghi "−1 credit", cạnh đó là lý do (không tooltip:
            trên cảm ứng tooltip không mở được, mà đây là thông tin về tiền). Không rõ quota ⇒ hộp thoại hỏi trước khi chạy. */}
        {freeRunsLeft != null && !paid ? (
          <Badge variant="success" data-testid="question-preview-quota">
            {t('employer.campaigns.questionCard.preview.quota.free').replace('{{n}}', String(freeRunsLeft))}
          </Badge>
        ) : null}
        {paid ? <p className="min-w-0 flex-1 basis-56 text-xs text-muted-foreground" data-testid="question-preview-quota">{t('employer.campaigns.questionCard.preview.quota.hint')}</p> : null}
      </div>

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
