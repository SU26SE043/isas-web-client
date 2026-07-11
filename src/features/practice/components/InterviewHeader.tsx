import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '@/components/BrandLogo';
import { useLanguage } from '../../../shared/languages';

interface InterviewHeaderProps {
  sessionId: string;
  isRecording: boolean;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({ sessionId, isRecording }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between bg-surface-raised px-6 py-3 shadow-md">
      <div className="flex items-center gap-6">
        <Link to="/">
          <BrandLogo />
        </Link>
        <div className="h-6 w-px bg-surface-raised/30" />
        <h1 className="text-lg font-bold text-white">{t('practice.title')}</h1>
      </div>

      <div className="flex items-center gap-5">
        {isRecording ? (
          <div className="flex items-center gap-2 rounded-full bg-error px-3 py-1.5 text-white">
            <div className="h-2 w-2 animate-pulse rounded-full bg-surface-raised" />
            <span className="text-sm font-medium">{t('practice.recording')}</span>
          </div>
        ) : null}
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-surface-overlay px-4 py-2 text-sm font-black text-foreground shadow-sm transition-colors hover:bg-surface-elevated"
          onClick={() => navigate(`/interview/${sessionId}/complete`)}
        >
          {t('practice.exit')}
        </button>
      </div>
    </header>
  );
};
