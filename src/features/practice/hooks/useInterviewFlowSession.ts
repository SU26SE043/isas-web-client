import { useEffect } from 'react';
import { useInterviewFlowStore } from '../stores/interviewFlowStore';

export function useInterviewFlowSession(sessionId: string) {
  const hydrate = useInterviewFlowStore((state) => state.hydrate);
  const hydratedSessionId = useInterviewFlowStore((state) => state.hydratedSessionId);

  useEffect(() => {
    if (!sessionId || hydratedSessionId === sessionId) return;
    hydrate(sessionId);
  }, [hydrate, hydratedSessionId, sessionId]);
}
