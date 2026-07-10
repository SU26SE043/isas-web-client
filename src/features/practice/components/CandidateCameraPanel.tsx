import React from 'react';

export const CandidateCameraPanel: React.FC = () => {

  return (
    <div className="bg-surface-raised rounded-lg shadow-sm border border-subtle overflow-hidden relative">
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-surface-base">
        <img 
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600&h=400" 
          alt="Candidate Camera" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
