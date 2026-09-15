import { useEffect, useRef } from 'react';
import { recordFocusEvent } from '../services/b2cPracticeSession.service';
import { useB2cPracticeInterviewStore } from '../stores/b2cPracticeInterviewStore';
import type { InterviewPhase } from './useB2cPracticeRoom';

/** Records one coaching event per hidden -> visible cycle, without changing room UI. */
export function useB2cFocusTracking(
  sessionId: string,
  enabled: boolean,
  phase: InterviewPhase,
): void {
  const stage = useB2cPracticeInterviewStore((state) => state.stage);
  const hiddenCycleRef = useRef(false);

  useEffect(() => {
    if (!enabled || stage !== 'interviewing' || !['reading', 'answering'].includes(phase)) {
      hiddenCycleRef.current = false;
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (hiddenCycleRef.current) return;
        hiddenCycleRef.current = true;
        void recordFocusEvent(sessionId, 'tab_switch');
      } else {
        hiddenCycleRef.current = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enabled, phase, sessionId, stage]);
}
