import { useCallback, useEffect, useState } from 'react';
import { employerService } from '../services/employer.service';
import type { CompanyProfileInput, EmployerWorkspace, VerificationInput } from '../types/employer.types';

export function useEmployerWorkspace() {
  const [workspace, setWorkspace] = useState<EmployerWorkspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setWorkspace(await employerService.getWorkspace());
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProfile = useCallback(async (input: CompanyProfileInput) => {
    const next = await employerService.saveCompanyProfile(input);
    setWorkspace(next);
    return next;
  }, []);

  const submitVerification = useCallback(async (input: VerificationInput) => {
    const next = await employerService.submitVerification(input);
    setWorkspace(next);
    return next;
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { workspace, isLoading, reload, saveProfile, submitVerification };
}
