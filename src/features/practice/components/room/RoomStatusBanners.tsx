import { useLanguage } from '@/shared/languages';
import { ExamClockReminder } from './ExamSessionClock';

interface RoomStatusBannersProps {
  mediaError: boolean;
  onRetryMedia: () => void;
  speechWarning: string | null;
  answerError: string | null;
  /** Đồng hồ cả buổi (buổi tính giờ) — `null` ⇒ không có dòng nhắc 5 phút. */
  examRemainingSeconds: number | null;
}

/** Các dải thông báo ngay dưới header phòng thi (tách khỏi `B2cPracticeInterviewRoom` cho gọn file). */
export function RoomStatusBanners({
  mediaError,
  onRetryMedia,
  speechWarning,
  answerError,
  examRemainingSeconds,
}: RoomStatusBannersProps) {
  const { t } = useLanguage();
  return (
    <>
      {examRemainingSeconds != null ? <ExamClockReminder remainingSeconds={examRemainingSeconds} /> : null}
      {mediaError ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t('practice.flow.device.denied')}
          <button type="button" className="ml-3 underline underline-offset-2" onClick={onRetryMedia}>
            {t('practice.flow.device.retry')}
          </button>
        </div>
      ) : null}
      {speechWarning ? (
        <div role="status" className="border-b border-warning/30 bg-warning/10 px-6 py-2 text-sm text-warning">
          {t(speechWarning)}
        </div>
      ) : null}
      {answerError ? (
        <div role="alert" className="border-b border-error/30 bg-error/10 px-6 py-2 text-sm text-error">
          {t(answerError)}
        </div>
      ) : null}
    </>
  );
}
