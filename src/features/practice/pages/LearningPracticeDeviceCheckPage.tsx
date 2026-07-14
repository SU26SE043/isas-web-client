import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useMediaDevices } from '../hooks/useMediaDevices';

export function LearningPracticeDeviceCheckPage() {
  const { roadmapId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { videoRef, state, errorKey, startPreview, stopStream } = useMediaDevices();

  useEffect(() => {
    void startPreview();
    return () => stopStream();
  }, [startPreview, stopStream]);

  return (
    <div className="page-container page-section min-h-screen">
      <Link
        to={`/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/theory`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {t('practice.learningPath.backToTheory')}
      </Link>

      <header className="mt-4 space-y-2">
        <h1 className="heading-primary text-3xl text-foreground">{t('practice.flow.device.title')}</h1>
        <p className="body-text text-sm text-muted-foreground">{t('practice.flow.device.description')}</p>
      </header>

      <div className="mt-6 rounded-xl border border-subtle bg-surface-raised p-6">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-base">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
            aria-label={t('practice.flow.device.previewLabel')}
          />
          {state === 'requesting' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-base/80 text-sm text-muted-foreground">
              {t('practice.flow.device.requesting')}
            </div>
          ) : null}
        </div>

        <p className="mt-4 text-sm text-foreground">
          {state === 'ready'
            ? t('practice.flow.device.passed')
            : state === 'denied' || state === 'unavailable'
              ? t(errorKey ?? 'practice.flow.device.denied')
              : t('practice.flow.device.hint')}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" className="btn-secondary" onClick={() => void startPreview()}>
            {t('practice.flow.device.retry')}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={state !== 'ready'}
            onClick={() =>
              navigate(`/candidate/learning/roadmaps/${roadmapId}/lessons/${lessonId}/practice`)
            }
          >
            {t('practice.learningPath.startPractice')}
          </button>
        </div>
      </div>
    </div>
  );
}
