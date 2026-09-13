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
  /** Quota THEO CÂU (D-4: 1 lượt miễn phí / câu / bản thước đo). `null` = không biết. */
  freeRunsLeft: number | null;
  disabled: boolean;
  isRunning: boolean;
  onRun: (customAnswer: string | null) => void;
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

  const fire = () => onRun(customValue.trim() ? customValue.trim() : null);
  const submit = () => {
    if (requireConfirm || paid) {
      setConfirmOpen(true);
      return;
    }
    fire();
  };

  const baseLabel = savesBeforeRun ? t('employer.campaigns.rubricPreview.runSave') : t('employer.campaigns.rubricPreview.run');
  const runLabel = paid ? t('employer.campaigns.rubricPreview.runPaid').replace('{{label}}', baseLabel) : baseLabel;
  const versionSentence = currentRubricVersion != null
    ? t('employer.campaigns.rubricPreview.confirm.description').replace('{{next}}', String(currentRubricVersion + 1)).replace('{{current}}', String(currentRubricVersion))
    : t('employer.campaigns.rubricPreview.confirm.descriptionUnknown');
  const confirmDescription = [
    paid ? t('employer.campaigns.questionCard.preview.confirm.paidDescription') : null,
    requireConfirm ? versionSentence : null,
  ].filter(Boolean).join(' ');

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
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={paid ? t('employer.campaigns.rubricPreview.confirm.paidTitle') : t('employer.campaigns.rubricPreview.confirm.title')}
        description={confirmDescription}
        confirmLabel={paid ? runLabel : t('employer.campaigns.rubricPreview.confirm.confirm')}
        cancelLabel={t('employer.campaigns.rubricPreview.confirm.cancel')}
        onConfirm={() => {
          setConfirmOpen(false);
          fire();
        }}
      />
    </div>
  );
}
