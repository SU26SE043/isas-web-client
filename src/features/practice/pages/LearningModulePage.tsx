import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningService } from '../services/learning.service';
import type { LearningModuleContent } from '../types/learning.types';

export const LearningModulePage: React.FC = () => {
  const { moduleId = '' } = useParams();
  const { t, language } = useLanguage();
  const [content, setContent] = useState<LearningModuleContent | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void learningService
      .getModuleContent(moduleId)
      .then((data) => {
        if (!active) return;
        setContent(data);
        setProgress(35);
      })
      .catch(() => {
        if (!active) return;
        setError(t('practice.learning.module.error'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [moduleId, t]);

  const sectionProgressStep = useMemo(() => {
    if (!content?.sections.length) return 0;
    return Math.floor(100 / content.sections.length);
  }, [content?.sections.length]);

  const handleMarkProgress = async () => {
    if (!content) return;
    const next = Math.min(progress + sectionProgressStep, 100);
    setIsSaving(true);
    try {
      const updated = await learningService.completeModule(moduleId, next);
      setProgress(updated.progressPercent);
      setCompleted(updated.status === 'completed');
    } catch {
      setError(t('practice.learning.module.error'));
    } finally {
      setIsSaving(false);
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
          <Link to="/candidate/learning" className="hover:text-foreground hover:underline">
            {t('practice.learning.title')}
          </Link>
          <span className="mx-2">{'>'}</span>
          <span>{moduleId}</span>
        </nav>

        {error ? <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">{error}</p> : null}

        {content ? (
          <>
            <header className="space-y-2">
              <h1 className="heading-primary text-3xl text-foreground">{t('practice.learning.module.title')}</h1>
              <p className="body-text text-sm text-muted-foreground">{t('practice.learning.module.subtitle')}</p>
            </header>

            <div className="rounded-xl border border-subtle bg-surface-raised p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('practice.learning.progress')}</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-overlay">
                <div className="h-full rounded-full bg-foreground" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {t('practice.learning.module.passHint').replace('{percent}', '80')}
              </p>
            </div>

            <div className="space-y-4">
              {content.sections.map((section) => (
                <article key={section.id} className="rounded-xl border border-subtle bg-surface-raised p-5">
                  <h2 className="heading-secondary text-lg text-foreground">
                    {language === 'vi' ? section.titleVi : section.title}
                  </h2>
                  <p className="body-text mt-2 text-sm text-muted-foreground">
                    {language === 'vi' ? section.bodyVi : section.body}
                  </p>
                </article>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary" disabled={isSaving || completed} onClick={() => void handleMarkProgress()}>
                {completed ? t('practice.learning.module.completed') : t('practice.learning.module.markProgress')}
              </button>
              <Link to={`/candidate/learning/${moduleId}/practice`} className="btn-secondary">
                {t('practice.learning.practice.start')}
              </Link>
              <Link to="/candidate/roadmap" className="btn-secondary">
                {t('practice.roadmap.title')}
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
