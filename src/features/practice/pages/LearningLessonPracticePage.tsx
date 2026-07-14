import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Mic, Video } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningPathService } from '../services/learningPath.service';
import type {
  LearningPracticeQuestion,
  LearningPracticeQuestionFeedback,
  LearningPracticeReport,
} from '../types/learningPath.types';

type Answered = {
  question: LearningPracticeQuestion;
  feedback: LearningPracticeQuestionFeedback;
};

export function LearningLessonPracticePage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [questions, setQuestions] = useState<LearningPracticeQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState<Answered[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<LearningPracticeQuestionFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    void learningPathService
      .getPracticeQuestions()
      .then((next) => {
        if (active) setQuestions(next);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const question = questions[index];
  const isLast = index >= questions.length - 1;

  const handleAnswer = async () => {
    if (!question || currentFeedback) return;
    setIsEvaluating(true);
    try {
      const feedback = await learningPathService.evaluateAnswer(question.id);
      setCurrentFeedback(feedback);
      setAnswered((prev) => [...prev, { question, feedback }]);
    } catch {
      setError(true);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setCurrentFeedback(null);
    setIndex((value) => value + 1);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const questionFeedback: LearningPracticeReport['questionFeedback'] = answered.map((item) => ({
        questionId: item.question.id,
        prompt: item.question.prompt,
        promptVi: item.question.promptVi,
        feedback: item.feedback,
      }));
      const { report } = await learningPathService.completePracticeSession(
        roadmapId,
        lessonId,
        questionFeedback,
      );
      navigate(`/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/report?reportId=${report.id}`);
    } catch {
      setError(true);
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (error || !question) {
    return <p className="page-container page-section text-sm text-error">{t('practice.learningPath.error')}</p>;
  }

  const prompt = language === 'vi' ? question.promptVi : question.prompt;

  return (
    <div className="page-container page-section min-h-screen">
      <header className="mb-6 space-y-1">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.learningPath.practiceSession')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('practice.learningPath.questionProgress')
            .replace('{current}', String(index + 1))
            .replace('{total}', String(questions.length))}
        </p>
      </header>

      <section className="rounded-xl border border-subtle bg-surface-raised p-6">
        <div className="mb-4 flex gap-3 text-muted-foreground">
          <Video className="size-5" aria-hidden />
          <Mic className="size-5" aria-hidden />
          <span className="text-sm">{t('practice.learningPath.avHint')}</span>
        </div>
        <h2 className="heading-secondary text-xl text-foreground">{prompt}</h2>

        {!currentFeedback ? (
          <button
            type="button"
            className="btn-primary mt-6"
            disabled={isEvaluating}
            onClick={() => void handleAnswer()}
          >
            {isEvaluating
              ? t('practice.learningPath.evaluating')
              : t('practice.learningPath.submitAnswerLive')}
          </button>
        ) : (
          <div className="mt-6 space-y-3 rounded-lg border border-subtle bg-surface-overlay p-4">
            <p className="text-sm font-medium text-foreground">
              {t('practice.learningPath.liveScore')}: {currentFeedback.score}
            </p>
            <FeedbackBlock
              label={t('practice.learningPath.strengths')}
              items={language === 'vi' ? currentFeedback.strengthsVi : currentFeedback.strengths}
            />
            <FeedbackBlock
              label={t('practice.learningPath.weaknesses')}
              items={language === 'vi' ? currentFeedback.weaknessesVi : currentFeedback.weaknesses}
            />
            <FeedbackBlock
              label={t('practice.learningPath.missing')}
              items={language === 'vi' ? currentFeedback.missingKnowledgeVi : currentFeedback.missingKnowledge}
            />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{t('practice.learningPath.betterAnswer')}: </span>
              {language === 'vi' ? currentFeedback.betterAnswerVi : currentFeedback.betterAnswer}
            </p>
            <FeedbackBlock
              label={t('practice.learningPath.tips')}
              items={language === 'vi' ? currentFeedback.tipsVi : currentFeedback.tips}
            />

            {isLast ? (
              <button
                type="button"
                className="btn-primary mt-2"
                disabled={isCompleting}
                onClick={() => void handleComplete()}
              >
                {isCompleting
                  ? t('practice.learningPath.completing')
                  : t('practice.learningPath.completeSession')}
              </button>
            ) : (
              <button type="button" className="btn-primary mt-2" onClick={handleNext}>
                {t('practice.learningPath.nextQuestion')}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function FeedbackBlock({ label, items }: { label: string; items: string[] }) {
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
