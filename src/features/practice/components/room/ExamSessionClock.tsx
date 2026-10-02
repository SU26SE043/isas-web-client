import { Timer } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';
import { formatTimerSeconds } from '../../utils/questionTimer';
import {
  getExamClockMilestone,
  getExamClockSeverity,
  type ExamClockMilestone,
  type ExamClockSeverity,
} from '../../utils/examSessionClock';

const FRAME_CLASS: Record<ExamClockSeverity, string> = {
  normal: 'border-satin bg-surface-overlay/60',
  warning: 'border-warning/50 bg-warning/10',
  critical: 'border-error/50 bg-error/10',
};

const TEXT_CLASS: Record<ExamClockSeverity, string> = {
  normal: 'text-foreground',
  warning: 'text-warning',
  critical: 'text-error',
};

const MILESTONE_KEY: Record<ExamClockMilestone, string> = {
  fiveMinutes: 'practice.examClock.announce.fiveMinutes',
  oneMinute: 'practice.examClock.announce.oneMinute',
  timeUp: 'practice.examClock.announce.timeUp',
};

/**
 * ATT1-F4 — "Thời gian bài thi ⏱ mm:ss (theo giờ hệ thống)" ở header phòng thi B2B.
 * ≤ 5 phút màu cảnh báo, ≤ 1 phút màu lỗi. Số chạy từng giây KHÔNG được đọc (aria-live off); vùng
 * `role="status"` riêng chỉ đổi chữ ở mốc 5 phút / 1 phút / 0 ⇒ trình đọc màn hình chỉ báo 3 lần.
 */
export function ExamSessionClock({ remainingSeconds }: { remainingSeconds: number }) {
  const { t } = useLanguage();
  const severity = getExamClockSeverity(remainingSeconds);
  const milestone = getExamClockMilestone(remainingSeconds);

  return (
    <div
      className={cn('flex flex-col items-center rounded-lg border px-3 py-1 sm:items-end', FRAME_CLASS[severity])}
      data-testid="exam-session-clock"
      data-severity={severity}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('practice.examClock.label')}</span>
        <Timer className={cn('size-4 shrink-0', TEXT_CLASS[severity])} aria-hidden />
        <span
          className={cn('text-lg font-semibold tabular-nums tracking-wide', TEXT_CLASS[severity])}
          aria-live="off"
          data-testid="exam-session-clock-value"
        >
          {formatTimerSeconds(remainingSeconds)}
        </span>
      </div>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {t('practice.examClock.serverTime')}
      </span>
      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {milestone ? t(MILESTONE_KEY[milestone]) : ''}
      </span>
    </div>
  );
}

/**
 * Dòng nhắc dưới header khi còn ≤ 5 phút (và > 0). Không live — vùng status của đồng hồ đã báo.
 * ≤ 1 phút đổi chữ ("Còn dưới 1 phút …") — giữ "Còn 5 phút" lúc 00:35 là nói sai giờ với ứng viên.
 */
export function ExamClockReminder({ remainingSeconds }: { remainingSeconds: number }) {
  const { t } = useLanguage();
  const severity = getExamClockSeverity(remainingSeconds);
  if (severity === 'normal' || remainingSeconds <= 0) return null;
  const critical = severity === 'critical';
  return (
    <p
      className={cn(
        'border-b px-6 py-2 text-sm',
        critical ? 'border-error/30 bg-error/10 text-error' : 'border-warning/30 bg-warning/10 text-warning',
      )}
      data-testid="exam-clock-reminder"
    >
      {t(critical ? 'practice.examClock.reminderCritical' : 'practice.examClock.reminder')}
    </p>
  );
}
