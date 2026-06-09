import React from 'react';
import { CVResultLeftPanel } from '../components/CVResultLeftPanel';
import { CVResultRightPanel } from '../components/CVResultRightPanel';
import { CVResultBottomPanel } from '../components/CVResultBottomPanel';

export const CVResultPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-8">
      <div className="w-full px-6 lg:px-16 xl:px-32 space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CVResultLeftPanel />
          <CVResultRightPanel />
        </div>

        <CVResultBottomPanel />

      </div>
    </div>
  );
};
