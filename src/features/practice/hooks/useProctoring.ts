import { useEffect } from 'react';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';

export function useProctoring(enabled: boolean) {
  const registerTabViolation = useInterviewSessionStore((state) => state.registerTabViolation);
  const setTabHidden = useInterviewSessionStore((state) => state.setTabHidden);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibility = () => {
      const hidden = document.visibilityState === 'hidden';
      setTabHidden(hidden);
      if (hidden) registerTabViolation();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [enabled, registerTabViolation, setTabHidden]);
}
