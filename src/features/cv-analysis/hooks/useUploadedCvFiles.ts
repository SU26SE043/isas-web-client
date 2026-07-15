import { useCallback, useEffect, useState } from 'react';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { UploadedCvFile } from '../types/cvAnalysis.types';

export function useUploadedCvFiles() {
  const [files, setFiles] = useState<UploadedCvFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setFiles(await cvAnalysisService.listUploadedCvs());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { files, isLoading, reload };
}
