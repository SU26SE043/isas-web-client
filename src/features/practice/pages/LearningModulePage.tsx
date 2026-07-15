import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { learningService } from '../services/learning.service';
import type { LearningModule, LearningModuleContent } from '../types/learning.types';

export const LearningModulePage: React.FC = () => {
  const { moduleId = '' } = useParams();
  const { t, language } = useLanguage();
  const [moduleMeta, setModuleMeta] = useState<LearningModule | null>(null);
  const [content, setContent] = useState<LearningModuleContent | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!moduleId) {
      setError('load_failed');
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);
    void Promise.all([learningService.getModule(moduleId), learningService.getModuleContent(moduleId)])
      .then(([meta, data]) => {
        if (!active) return;
        setError(null);
        setModuleMeta(meta);
        setContent(data);
        setProgress(meta.progressPercent);
        setCompleted(meta.status === 'completed');
      })
      .catch(() => {
        if (!active) return;
        setError('load_failed');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [moduleId]);

  const sectionProgressStep = useMemo(() => {
    if (!content?.sections.length) return 0;
    return Math.floor(100 / content.sections.length);
  }, [content?.sections.length]);

  const passThreshold = moduleMeta?.passThreshold ?? 80;
  const moduleTitle =
    moduleMeta && language === 'vi' ? moduleMeta.titleVi : moduleMeta?.title ?? moduleId;

  const handleMarkProgress = async () => {
    if (!content) return;
    const next = Math.min(progress + sectionProgressStep, 100);
    setIsSaving(true);
    try {
      const updated = await learningService.completeModule(moduleId, next);
      setModuleMeta(updated);
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
          <span className="text-foreground">{moduleTitle}</span>
        </nav>

        {error ? (
          <p className="rounded-lg border border-error/20 bg-error-bg px-4 py-3 text-sm text-error">
            {t('practice.learning.module.error')}
          </p>
        ) : null}

        {content && moduleMeta ? (
          <>
            <header className="space-y-2">
              <h1 className="heading-primary text-3xl text-foreground">{moduleTitle}</h1>
              <p className="body-text text-sm text-muted-foreground">
                {language === 'vi' ? moduleMeta.descriptionVi : moduleMeta.description}
              </p>
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
                {t('practice.learning.module.passHint').replace('{percent}', String(passThreshold))}
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
              <button
                type="button"
                className="btn-primary"
                disabled={isSaving || completed}
                onClick={() => void handleMarkProgress()}
              >
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
