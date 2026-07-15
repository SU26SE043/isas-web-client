import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { profileService } from '../services/profile.service';
import type { CandidateProfile } from '../types/profile.types';
import { calculateProfileCompleteness } from '../utils/completeness';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch {
      setError('failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const completeness = profile
    ? calculateProfileCompleteness(profile, user ?? undefined)
    : null;

  return { profile, completeness, isLoading, error, reload: load, setProfile };
}
