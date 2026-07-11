import { useEffect } from 'react';
import { practiceSessionService } from '../services/practiceSession.service';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';

export function useProctoring(sessionId: string, enabled: boolean) {
  const registerTabViolation = useInterviewSessionStore((state) => state.registerTabViolation);
  const setTabHidden = useInterviewSessionStore((state) => state.setTabHidden);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      const hidden = document.visibilityState === 'hidden';
      setTabHidden(hidden);
      if (!hidden) return;

      registerTabViolation();
      void practiceSessionService.reportProctoringEvent(sessionId, {
        type: 'tab_switch',
        occurredAt: new Date().toISOString(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, registerTabViolation, sessionId, setTabHidden]);
}
