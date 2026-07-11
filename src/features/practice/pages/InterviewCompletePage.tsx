import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '@/shared/languages';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';

export const InterviewCompletePage: React.FC = () => {
  const { sessionId = '' } = useParams();
  const { t } = useLanguage();
  const reset = useInterviewFlowStore((state) => state.reset);

  return (
    <div className="page-container page-section flex min-h-screen items-center justify-center">
      <div className="w-full max-w-lg rounded-xl border border-subtle bg-surface-raised p-8 text-center">
        <h1 className="heading-primary text-2xl">{t('practice.flow.complete.title')}</h1>
        <p className="body-text mt-3">{t('practice.flow.complete.description')}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/practice/result?sessionId=${sessionId}`}
            className="btn-primary"
            onClick={() => reset()}
          >
            {t('practice.flow.complete.viewResult')}
          </Link>
          <Link
            to="/candidate/practice/history"
            className="btn-secondary"
            onClick={() => reset()}
          >
            {t('practice.flow.complete.viewHistory')}
          </Link>
        </div>
      </div>
    </div>
  );
};
