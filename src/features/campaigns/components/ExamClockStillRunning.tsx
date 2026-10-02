import { Timer } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { cn } from '@/lib/utils';

/** ATT1-F4 — dòng "Đồng hồ bài thi vẫn chạy" trên overlay vi phạm / toàn màn hình (đồng hồ cả buổi không dừng). */
export function ExamClockStillRunning({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <p className={cn('flex items-center gap-2 text-sm font-medium text-warning', className)} data-testid="exam-clock-still-running">
      <Timer className="size-4 shrink-0" aria-hidden />
      {t('practice.examClock.stillRunning')}
    </p>
  );
}
