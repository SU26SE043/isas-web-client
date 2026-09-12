import { cn } from '@/lib/utils';
import { useLanguage } from '@/shared/languages';
import { groupQuestionsByRoot } from '@/shared/utils/questionNumbering';
import type { QuestionResultViewModel } from '../../utils/practiceSessionResultViewModel';
import { getQuestionStatusGroup } from '../../utils/practiceSessionResultFormat';
import { PracticeQuestionResultCard } from './PracticeQuestionResultCard';

interface ReportQuestionDetailProps {
  questions: QuestionResultViewModel[];
  sessionId: string;
  /** Chỉ số PHẲNG trong `questions` (đồng bộ với `?question=`); trỏ vào câu đào sâu vẫn mở đúng nhóm gốc của nó. */
  activeQuestionIndex: number;
  onQuestionChange: (index: number) => void;
}

/**
 * Dải tab chỉ liệt kê CÂU GỐC (1 · 2 · 3…); bấm vào một câu gốc thì thẻ của nó và mọi câu theo sau (1.1, 1.2…)
 * hiện cùng nhau bên dưới. Trước đây mỗi câu — kể cả câu đào sâu — là một tab riêng ⇒ buổi 5 gốc × 3 tầng
 * là 20 tab và người luyện phải bấm từng câu con để đọc trọn một chủ đề.
 */
export function ReportQuestionDetail({
  questions,
  sessionId,
  activeQuestionIndex,
  onQuestionChange,
}: ReportQuestionDetailProps) {
  const { t } = useLanguage();
  const active = questions[activeQuestionIndex];
  const groups = groupQuestionsByRoot(questions, (item) => item.kind);
  const activeGroup = groups.find((group) => group.root === active || group.children.includes(active)) ?? groups[0];

  if (!questions.length || !active || !activeGroup) {
    return (
      <p className="text-sm text-muted-foreground">{t('practice.result.noQuestionsDescription')}</p>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="report-questions-heading">
      <h2 id="report-questions-heading" className="text-lg font-semibold text-foreground">
        {t('practice.result.questionReview')}
      </h2>

      {groups.length > 1 ? (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 text-xs font-semibold text-foreground/80">
            {t('practice.result.jumpToQuestion')}
          </span>
          <div
            role="tablist"
            aria-label={t('practice.result.jumpToQuestion')}
            className="flex gap-2"
          >
            {groups.map((group) => {
              const isActive = group === activeGroup;
              const status = getQuestionStatusGroup(group.root.status, group.root.answered);
              return (
                <button
                  key={group.root.questionId}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  title={t(`practice.result.questionStatus.${status}`)}
                  onClick={() => onQuestionChange(questions.indexOf(group.root))}
                  className={cn(
                    'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-150',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--border-focus)]',
                    isActive
                      ? 'border-info/70 bg-gradient-to-r from-info/20 to-info-500/20 text-info-light shadow-[0_0_14px_-8px_var(--color-info)]'
                      : status === 'graded' || status === 'answered'
                        ? 'border-success/40 bg-success/10 text-success-light hover:bg-success/15'
                        : 'border-satin bg-surface-overlay/30 text-muted-foreground hover:border-info/40 hover:bg-info/10 hover:text-info-light',
                  )}
                >
                  {t('practice.result.question')} {group.root.label}
                  {group.children.length ? (
                    <span className="ml-1 font-normal opacity-70" aria-label={t('practice.result.followUpCount').replace('{{n}}', String(group.children.length))}>
                      +{group.children.length}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <PracticeQuestionResultCard
        key={activeGroup.root.answerId ?? activeGroup.root.questionId}
        question={activeGroup.root}
        sessionId={sessionId}
        defaultOpen
      />

      {activeGroup.children.length ? (
        <div className="space-y-3 border-l-2 border-info/30 pl-3 sm:pl-4" aria-label={t('practice.result.followUps')}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('practice.result.followUps')} · {activeGroup.children.length}
          </p>
          {activeGroup.children.map((child) => (
            <PracticeQuestionResultCard
              key={child.answerId ?? child.questionId}
              question={child}
              sessionId={sessionId}
              defaultOpen
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
