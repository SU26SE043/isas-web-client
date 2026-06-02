import React from 'react';
import { useLanguage } from '../../../shared/languages';

export const CandidateCameraPanel: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-slate-900">
        <img 
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=400" 
          alt="Candidate Camera" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
