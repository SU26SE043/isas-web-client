import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningService } from '../services/learning.service';
import type { LearningModule, LearningPracticeSession } from '../types/learning.types';

export const LearningPracticePage: React.FC = () => {
  const { moduleId = '' } = useParams();
  const { t, language } = useLanguage();
  const [moduleMeta, setModuleMeta] = useState<LearningModule | null>(null);
  const [session, setSession] = useState<LearningPracticeSession | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPrompt = session?.prompts[promptIndex];
  const passThreshold = moduleMeta?.passThreshold ?? 80;

  useEffect(() => {
    let active = true;
    void Promise.all([learningService.getModule(moduleId), learningService.startPracticeSession(moduleId)])
      .then(([meta, data]) => {
        if (!active) return;
        setModuleMeta(meta);
        setSession(data);
        setSecondsLeft(data.prompts[0]?.durationSeconds ?? 60);
      })
      .catch(() => {
        if (active) setError('load_failed');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [moduleId]);

  useEffect(() => {
    if (!currentPrompt || done) return;
    if (secondsLeft <= 0) return;

    const timer = window.setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [currentPrompt, done, secondsLeft]);

  const timerLabel = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [secondsLeft]);

  const handleSubmit = async () => {
    if (!session) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const nextIndex = promptIndex + 1;
      if (nextIndex >= session.prompts.length) {
        await learningService.submitPracticeAnswer(moduleId, passThreshold);
        setDone(true);
        return;
      }

      setPromptIndex(nextIndex);
      setAnswer('');
      setSecondsLeft(session.prompts[nextIndex].durationSeconds);
    } catch {
      setError(t('practice.learning.practice.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="page-container page-section mx-auto max-w-3xl space-y-6">
        <nav className="text-sm text-muted-foreground">
          <Link to={`/candidate/learning/${moduleId}`} className="hover:text-foreground hover:underline">
            {moduleMeta
              ? language === 'vi'
                ? moduleMeta.titleVi
                : moduleMeta.title
              : t('practice.learning.module.title')}
          </Link>
          <span className="mx-2">{'>'}</span>
          <span>{t('practice.learning.practice.title')}</span>
        </nav>

        {error ? (
          <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {t('practice.learning.practice.error')}
          </p>
        ) : null}

        {done ? (
          <div className="rounded-xl border border-subtle bg-surface-raised p-8 text-center">
            <h1 className="heading-primary text-2xl text-foreground">{t('practice.learning.practice.completeTitle')}</h1>
            <p className="body-text mt-3 text-sm text-muted-foreground">{t('practice.learning.practice.completeDescription')}</p>
            <Link to={`/candidate/learning/${moduleId}`} className="btn-primary mt-6 inline-flex">
              {t('practice.learning.practice.backToModule')}
            </Link>
          </div>
        ) : currentPrompt ? (
          <div className="space-y-4 rounded-xl border border-subtle bg-surface-raised p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {t('practice.learning.practice.promptLabel')
                  .replace('{current}', String(promptIndex + 1))
                  .replace('{total}', String(session?.prompts.length ?? 0))}
              </p>
              <span className="rounded-full bg-surface-overlay px-3 py-1 text-sm font-semibold text-foreground">
                {timerLabel}
              </span>
            </div>
            <h1 className="heading-primary text-2xl text-foreground">
              {language === 'vi' ? currentPrompt.promptVi : currentPrompt.prompt}
            </h1>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={8}
              className="w-full rounded-lg border border-default bg-surface-overlay px-4 py-3 text-sm text-foreground"
              placeholder={t('practice.learning.practice.answerPlaceholder')}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={isSubmitting || answer.trim().length < 10}
              onClick={() => void handleSubmit()}
            >
              {promptIndex + 1 >= (session?.prompts.length ?? 0)
                ? t('practice.learning.practice.finish')
                : t('practice.learning.practice.nextPrompt')}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
