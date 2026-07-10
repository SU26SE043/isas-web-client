import { useCallback, useEffect, useState } from 'react';
import { profileService } from '../services/profile.service';
import type { DashboardSummary } from '../types/profile.types';

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getDashboardSummary();
      setSummary(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { summary, isLoading, reload: load };
}
