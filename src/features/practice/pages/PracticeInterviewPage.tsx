import React from 'react';
import { InterviewHeader } from '../components/InterviewHeader';
import { AIInterviewerPanel } from '../components/AIInterviewerPanel';
import { CandidateCameraPanel } from '../components/CandidateCameraPanel';
import { InterviewInfoCard } from '../components/InterviewInfoCard';
import { PersonalNotes } from '../components/PersonalNotes';
import { InterviewControls } from '../components/InterviewControls';

export const PracticeInterviewPage: React.FC = () => {
  return (
    <div className="min-h-screen surface-base font-sans flex flex-col pb-24">
      {/* Header */}
      <InterviewHeader />

      {/* Main Content Layout */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          
          {/* Left Column (AI Panel) */}
          <div className="lg:col-span-8 h-[calc(100vh-140px)] min-h-[600px]">
            <AIInterviewerPanel />
          </div>
          
          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 flex flex-col gap-6 h-[calc(100vh-140px)] min-h-[600px]">
            <CandidateCameraPanel />
            <InterviewInfoCard />
            <PersonalNotes />
          </div>
          
        </div>
      </main>

      {/* Floating Bottom Controls */}
      <InterviewControls />
    </div>
  );
};
