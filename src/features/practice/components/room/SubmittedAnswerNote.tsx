import { useLanguage } from '@/shared/languages';

/** Khung "Đã nộp câu trả lời" + transcript dưới câu hỏi (tách khỏi `B2cPracticeInterviewRoom` cho gọn file). */
export function SubmittedAnswerNote({ transcript }: { transcript?: string | null }) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-satin bg-surface-raised p-4 text-sm">
      <p className="font-medium text-foreground">{t('practice.recording.submitted')}</p>
      <p className="mt-2 text-muted-foreground">
        {transcript
          ? `${t('practice.answer.transcriptTitle')}: ${transcript}`
          : t('practice.answer.transcriptPending')}
      </p>
    </div>
  );
}
