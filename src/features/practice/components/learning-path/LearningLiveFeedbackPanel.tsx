import React from 'react';
import { useLanguage } from '@/shared/languages';
import type { LearningPracticeQuestionFeedback } from '../../types/learningPath.types';

interface LearningLiveFeedbackPanelProps {
  feedback: LearningPracticeQuestionFeedback;
  language: 'vi' | 'en';
}

export const LearningLiveFeedbackPanel: React.FC<LearningLiveFeedbackPanelProps> = ({
  feedback,
  language,
}) => {
  const { t } = useLanguage();

  return (
    <aside
      className="border-t border-subtle bg-surface-raised/95 px-6 py-4 backdrop-blur-sm"
      aria-live="polite"
    >
      <div className="mx-auto grid max-w-[1400px] gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    </aside>
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
