import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';
import type { LessonRetryErrorCode } from '../../hooks/useLessonRetry';

interface LessonRetryConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle: string;
  balance: number;
  isPending: boolean;
  errorCode: LessonRetryErrorCode | null;
  onConfirm: () => void;
}

/**
 * 402 có lối đi RIÊNG dẫn thẳng tới trang nạp credit. Gộp nó vào câu lỗi chung
 * thì người học chỉ biết "thất bại" mà không biết phải làm gì tiếp.
 */
function RetryError({ errorCode }: { errorCode: LessonRetryErrorCode | null }) {
  const { t } = useLanguage();
  if (errorCode === 'insufficient_credits') {
    return (
      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3" role="alert">
        <p className="text-sm text-warning">{t('practice.learningPath.retryInsufficientCredits')}</p>
        <Link to="/candidate/credits" className="btn-primary inline-flex text-xs">
          {t('practice.learningPath.buyCredits')}
        </Link>
      </div>
    );
  }
  if (errorCode === 'generic') {
    return (
      <p className="mt-4 text-sm text-error" role="alert">
        {t('practice.learningPath.retryError')}
      </p>
    );
  }
  return null;
}

/**
 * Hộp thoại xác nhận trước khi luyện lại một bài.
 *
 * Bắt buộc phải có vì thao tác này TIÊU CREDIT THẬT: nó nói rõ giá, nói rõ câu
 * hỏi sẽ khác, và nói rõ điểm được ghi thêm chứ không đè lên kết quả cũ — ba
 * điều người học không đoán được từ nhãn nút.
 */
export function LessonRetryConfirmDialog({
  open,
  onOpenChange,
  lessonTitle,
  balance,
  isPending,
  errorCode,
  onConfirm,
}: LessonRetryConfirmDialogProps) {
  const { t } = useLanguage();

  return (
    <>
    <RetryError errorCode={errorCode} />
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('practice.learningPath.retryConfirmTitle')}</DialogTitle>
          <DialogDescription>
            {t('practice.learningPath.retryConfirmDescription').replace(
              '{balance}',
              balance.toLocaleString(),
            )}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm font-medium text-foreground">{lessonTitle}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>{t('practice.learningPath.retryConfirmPointQuestions')}</li>
          <li>{t('practice.learningPath.retryConfirmPointScore')}</li>
          <li>{t('practice.learningPath.retryConfirmPointSnapshot')}</li>
        </ul>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            {t('practice.learningPath.retryCancel')}
          </Button>
          <Button type="button" disabled={isPending} onClick={onConfirm}>
            {isPending
              ? t('practice.learningPath.retryStarting')
              : t('practice.learningPath.retryConfirmCta')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
