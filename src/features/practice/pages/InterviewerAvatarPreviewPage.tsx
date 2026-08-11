import { useState } from 'react';
import { AIInterviewerPanel } from '../components/AIInterviewerPanel';

/**
 * Dev-only harness cho avatar 3D người phỏng vấn (`/dev/interviewer-avatar`).
 * Cho phép xem khung hình và kiểm tra nhép miệng mà không cần tạo session thật.
 */
export function InterviewerAvatarPreviewPage() {
  const [speaking, setSpeaking] = useState(true);

  return (
    <div className="page-container page-section space-y-4 py-8">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">Interviewer avatar</h1>
        <button type="button" className="btn-secondary" onClick={() => setSpeaking((value) => !value)}>
          {speaking ? 'Stop speaking' : 'Start speaking'}
        </button>
      </div>
      <div className="h-[420px] max-w-3xl">
        <AIInterviewerPanel aiState={speaking ? 'speaking' : 'listening'} />
      </div>
    </div>
  );
}
