import { useEffect } from 'react';
import { useInterviewSessionStore } from '../stores/interviewSessionStore';

export function useNetworkStatus(enabled: boolean) {
  const setOffline = useInterviewSessionStore((state) => state.setOffline);

  useEffect(() => {
    if (!enabled) return;

    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    setOffline(!navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, setOffline]);
}
