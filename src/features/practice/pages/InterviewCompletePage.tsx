import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { practiceSessionService } from '../services/practiceSession.service';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';

type CompleteState = 'uploading' | 'done' | 'error';

export const InterviewCompletePage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const { t } = useLanguage();
  const resetFlow = useInterviewFlowStore((state) => state.reset);
  const [state, setState] = useState<CompleteState>('uploading');
  const [assessmentId, setAssessmentId] = useState('');

  useEffect(() => {
    let active = true;
    void practiceSessionService
      .completeSession(sessionId)
      .then((result) => {
        if (!active) return;
        setAssessmentId(result.assessmentId);
        setState('done');
      })
      .catch(() => {
        if (!active) return;
        setState('error');
      });
    return () => {
      active = false;
    };
  }, [sessionId]);

  const handleLeave = () => resetFlow();

  return (
    <div className="page-container page-section flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        {state === 'uploading' ? (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-muted-foreground" aria-hidden />
            <h1 className="heading-primary mt-4 text-2xl">{t('practice.flow.complete.uploadingTitle')}</h1>
            <p className="body-text mt-3">{t('practice.flow.complete.uploadingDescription')}</p>
            <p className="mt-2 text-caption text-muted-foreground">
              {t('practice.flow.complete.chunksUploaded').replace(
                '{count}',
                String(practiceSessionService.getUploadedChunkCount(sessionId)),
              )}
            </p>
          </>
        ) : null}

        {state === 'done' ? (
          <>
            <h1 className="heading-primary text-2xl">{t('practice.flow.complete.title')}</h1>
            <p className="body-text mt-3">{t('practice.flow.complete.description')}</p>
            <p className="mt-2 text-caption text-muted-foreground">
              {t('practice.flow.complete.assessmentId').replace('{id}', assessmentId)}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to={`/practice/result?assessmentId=${encodeURIComponent(assessmentId)}`}
                className="btn-primary"
                onClick={handleLeave}
              >
                {t('practice.flow.complete.viewResult')}
              </Link>
              <Link
                to="/candidate/practice/history"
                className="btn-secondary"
                onClick={handleLeave}
              >
                {t('practice.flow.complete.viewHistory')}
              </Link>
            </div>
          </>
        ) : null}

        {state === 'error' ? (
          <>
            <h1 className="heading-primary text-2xl">{t('practice.flow.complete.errorTitle')}</h1>
            <p className="body-text mt-3">{t('practice.flow.complete.errorDescription')}</p>
            <Link to="/candidate/dashboard" className="btn-primary mt-6 inline-flex" onClick={handleLeave}>
              {t('practice.flow.backToDashboard')}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  );
};
