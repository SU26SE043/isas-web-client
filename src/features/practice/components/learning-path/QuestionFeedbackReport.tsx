import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { LearningPracticeQuestionFeedback } from '../../types/learningPath.types';
import { cn } from '@/lib/utils';

interface QuestionFeedbackReportProps {
  feedback: LearningPracticeQuestionFeedback;
  language: 'vi' | 'en';
  prompt?: string;
  promptVi?: string;
  questionNumber?: number;
  className?: string;
  compact?: boolean;
}

export const QuestionFeedbackReport: React.FC<QuestionFeedbackReportProps> = ({
  feedback,
  language,
  prompt,
  promptVi,
  questionNumber,
  className,
  compact = false,
}) => {
  const { t } = useLanguage();
  const promptText = language === 'vi' ? (promptVi ?? prompt) : (prompt ?? promptVi);

  return (
    <article
      className={cn(
        'rounded-xl border border-subtle bg-surface-raised',
        compact ? 'p-4' : 'p-6',
        className,
      )}
    >
      {(questionNumber != null || promptText) && (
        <header className="mb-4 space-y-1 border-b border-subtle pb-3">
          {questionNumber != null ? (
            <p className="text-caption text-muted-foreground">
              {t('practice.learningPath.questionReportLabel').replace(
                '{number}',
                String(questionNumber),
              )}
            </p>
          ) : null}
          {promptText ? <h3 className="text-sm font-medium text-foreground">{promptText}</h3> : null}
        </header>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <p className="text-sm font-medium text-foreground md:col-span-2 lg:col-span-3">
          {t('practice.learningPath.liveScore')}: {feedback.score}
        </p>
        <FeedbackList
          label={t('practice.learningPath.strengths')}
          items={language === 'vi' ? feedback.strengthsVi : feedback.strengths}
        />
        <FeedbackList
          label={t('practice.learningPath.weaknesses')}
          items={language === 'vi' ? feedback.weaknessesVi : feedback.weaknesses}
        />
        <FeedbackList
          label={t('practice.learningPath.missing')}
          items={language === 'vi' ? feedback.missingKnowledgeVi : feedback.missingKnowledge}
        />
        <div className="md:col-span-2 lg:col-span-3">
          <p className="text-sm font-medium text-foreground">{t('practice.learningPath.betterAnswer')}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {language === 'vi' ? feedback.betterAnswerVi : feedback.betterAnswer}
          </p>
        </div>
        <FeedbackList
          label={t('practice.learningPath.tips')}
          items={language === 'vi' ? feedback.tipsVi : feedback.tips}
        />
      </div>
    </article>
  );
};

function FeedbackList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
