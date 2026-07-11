import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../shared/languages';
import { motion } from 'framer-motion';

interface InterviewControlsProps {
  sessionId: string;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({ sessionId }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center"
      style={{ touchAction: 'none' }}
    >
      <div className="bg-surface-raised rounded-lg shadow-sm border-6 border-default px-6 py-3 flex items-center gap-6 cursor-grab active:cursor-grabbing">
        <div className="flex flex-col gap-1 pr-2 border-r border-default opacity-50 hover:opacity-100 transition-opacity">
          <div className="w-1 h-1 rounded-full bg-white" />
          <div className="w-1 h-1 rounded-full bg-white" />
          <div className="w-1 h-1 rounded-full bg-white" />
        </div>

        <div className="flex items-center gap-3">
          <button type="button" className="w-10 h-10 rounded-full bg-surface-overlay flex items-center justify-center text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shadow-sm" aria-label={t('practice.flow.controls.mic')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button type="button" className="w-10 h-10 rounded-full bg-surface-overlay flex items-center justify-center text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shadow-sm" aria-label={t('practice.flow.controls.camera')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-6 border-l border-default pl-6">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-foreground tabular-nums tracking-wider leading-none ">01:23</span>
            <span className="text-[10px] text-white/70 font-medium mt-1.5 uppercase tracking-wider">{t('practice.currentQuestionTime')}</span>
          </div>

          <button
            type="button"
            className="btn-primary px-4 py-2 text-sm"
            onClick={() => navigate(`/interview/${sessionId}/complete`)}
          >
            {t('practice.flow.controls.finish')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
