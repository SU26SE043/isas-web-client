import { useEffect } from 'react';
import { practiceSessionService } from '../services/practiceSession.service';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';
import type { ViolationType } from '../types/proctoring.types';

function mapProctoringEvent(type: ViolationType) {
  if (type === 'face_mismatch') return 'face_mismatch' as const;
  if (type === 'focus_loss') return 'focus_loss' as const;
  return 'tab_switch' as const;
}

export function useProctoring(sessionId: string, enabled: boolean) {
  const registerViolation = useInterviewSessionStore((state) => state.registerViolation);
  const setTabHidden = useInterviewSessionStore((state) => state.setTabHidden);
  const dismissTabLockWarning = useInterviewSessionStore((state) => state.dismissTabLockWarning);

  useEffect(() => {
    if (!enabled) return;

    const report = (type: ViolationType) => {
      const status = useInterviewSessionStore.getState().status;
      if (status !== 'active') return;

      registerViolation(type);
      void practiceSessionService.reportProctoringEvent(sessionId, {
        type: mapProctoringEvent(type),
        occurredAt: new Date().toISOString(),
      });
    };

    const handleVisibility = () => {
      const hidden = document.visibilityState === 'hidden';
      setTabHidden(hidden);

      if (hidden) {
        report('tab_switch');
        return;
      }

      dismissTabLockWarning();
    };

    const handleBlur = () => {
      if (document.visibilityState === 'hidden') return;

      window.setTimeout(() => {
        const status = useInterviewSessionStore.getState().status;
        if (status !== 'active' || document.visibilityState === 'hidden') return;
        if (!document.hasFocus()) {
          report('focus_loss');
        }
      }, 150);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
    };
  }, [dismissTabLockWarning, enabled, registerViolation, sessionId, setTabHidden]);
}
