import React from 'react';
import { useLanguage } from '../../../shared/languages';
import { motion } from 'framer-motion';

export const InterviewControls: React.FC = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center"
      style={{ touchAction: "none" }}
    >
      <div className="bg-pine rounded-lg shadow-xl border-6 border-milk px-6 py-3 flex items-center gap-6 cursor-grab active:cursor-grabbing">

        {/* Drag Handle */}
        <div className="flex flex-col gap-1 pr-2 border-r border-white/20 opacity-50 hover:opacity-100 transition-opacity">
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <div className="w-1 h-1 rounded-full bg-white"></div>
          <div className="w-1 h-1 rounded-full bg-white"></div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pine hover:bg-slate-100 transition-colors cursor-pointer shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-pine hover:bg-slate-100 transition-colors cursor-pointer shadow-sm">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>



        {/* Timer & Settings */}
        <div className="flex items-center gap-6 border-l border-white/20 pl-6">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-black text-milk tabular-nums tracking-wider leading-none drop-shadow-sm">01:23</span>
            <span className="text-[10px] text-white/70 font-medium mt-1.5 uppercase tracking-wider">{t('practice.currentQuestionTime')}</span>
          </div>

          <button className="w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-colors cursor-pointer">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
