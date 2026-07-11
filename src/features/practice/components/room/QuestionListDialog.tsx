import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { PracticeQuestion } from '../../mocks/session.fixtures';

interface QuestionListDialogProps {
  open: boolean;
  questions: PracticeQuestion[];
  currentIndex: number;
  onClose: () => void;
}

export const QuestionListDialog: React.FC<QuestionListDialogProps> = ({
  open,
  questions,
  currentIndex,
  onClose,
}) => {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-list-title"
        className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-xl border border-default bg-surface-elevated"
      >
        <div className="flex items-center justify-between border-b border-subtle px-5 py-4">
          <h2 id="question-list-title" className="heading-secondary text-lg">
            {t('practice.room.questionListTitle')}
          </h2>
          <button type="button" className="btn-ghost px-3 py-1 text-sm" onClick={onClose}>
            {t('practice.room.questionListClose')}
          </button>
        </div>
        <ol className="max-h-[60vh] space-y-3 overflow-y-auto px-5 py-4">
          {questions.map((question, index) => {
            const isCurrent = index === currentIndex;
            return (
              <li
                key={question.id}
                className={`rounded-lg border p-3 text-sm ${
                  isCurrent
                    ? 'border-default bg-surface-overlay text-foreground'
                    : 'border-subtle text-muted-foreground'
                }`}
              >
                <span className="text-label text-muted-foreground">
                  {t('practice.room.questionListItem').replace('{n}', String(index + 1))}
                </span>
                <p className="mt-1">{question.content}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
