import React from 'react';
import type { LearningPracticeQuestionFeedback } from '../../types/learningPath.types';
import { QuestionFeedbackReport } from './QuestionFeedbackReport';

interface LearningLiveFeedbackPanelProps {
  feedback: LearningPracticeQuestionFeedback;
  language: 'vi' | 'en';
}

/** @deprecated Prefer QuestionFeedbackReport on dedicated report pages. */
export const LearningLiveFeedbackPanel: React.FC<LearningLiveFeedbackPanelProps> = ({
  feedback,
  language,
}) => <QuestionFeedbackReport feedback={feedback} language={language} className="rounded-none border-0 border-t" />;
