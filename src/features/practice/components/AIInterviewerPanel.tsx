import React, { useState, useEffect } from 'react';
import { LiveConversationArea } from './LiveConversationArea';
import { useLanguage } from '../../../shared/languages';

export const AIInterviewerPanel: React.FC = () => {
  const { t } = useLanguage();
  const [interviewerState, setInterviewerState] = useState<'listening' | 'thinking' | 'speaking'>('speaking');

  // Mock state cycle for demonstration purposes
  useEffect(() => {
    const cycle = () => {
      setInterviewerState(prev => {
        if (prev === 'speaking') return 'listening';
        if (prev === 'listening') return 'thinking';
        return 'speaking';
      });
    };
    const interval = setInterval(cycle, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStateConfig = () => {
    switch (interviewerState) {
      case 'speaking': 
        return { label: 'Speaking', color: 'bg-success', animation: 'animate-pulse' };
      case 'thinking': 
        return { label: 'Thinking...', color: 'bg-surface-overlay', animation: 'animate-ping' };
      case 'listening': 
        return { label: 'Listening', color: 'bg-info', animation: '' };
    }
  };

  const config = getStateConfig();

  return (
    <div className="bg-surface-raised rounded-lg shadow-sm border border-subtle flex flex-col justify-between h-full relative overflow-hidden">
      
      {/* Realistic Avatar Container */}
      <div className="relative flex-1 w-full bg-surface-base overflow-hidden">
        
        {/* Main Avatar Video Placeholder */}
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200&h=800" 
          alt="AI Interviewer" 
          className="w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: interviewerState === 'thinking' ? 0.8 : 1 }}
        />

        {/* Dynamic State Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-subtle shadow-lg transition-all duration-300">
          <div className="flex items-center justify-center w-3 h-3">
            <div className={`w-2 h-2 rounded-full ${config.color} ${config.animation}`}></div>
          </div>
          <span className="text-xs font-semibold text-white tracking-wide">{config.label}</span>
          
          {/* Voice waveform when speaking */}
          {interviewerState === 'speaking' && (
            <div className="flex items-center gap-0.5 ml-1 h-3">
              <div className="w-0.5 h-1.5 bg-surface-raised/80 rounded-full animate-[bounce_1s_infinite]"></div>
              <div className="w-0.5 h-3 bg-surface-raised/80 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
              <div className="w-0.5 h-2 bg-surface-raised/80 rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
              <div className="w-0.5 h-1.5 bg-surface-raised/80 rounded-full animate-[bounce_1s_infinite_0.1s]"></div>
            </div>
          )}
        </div>

        {/* Interviewer Info Overlay */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-default shadow-md">
            <h2 className="text-white font-bold text-sm ">{t('practice.aiName')}</h2>
            <p className="text-white/80 text-xs font-medium">{t('practice.aiRole')}</p>
          </div>
        </div>

        {/* Subtle gradient to ensure text readability */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
      </div>
      
      {/* Live Conversation Area (Edge to edge) */}
      <LiveConversationArea />
    </div>
  );
};
