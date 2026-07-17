import { useCallback, useEffect, useState } from 'react';
import { cvAnalysisService } from '../services/cvAnalysis.service';
import type { FileRecord } from '../types/cvAnalysis.types';

export function useInterviewFiles() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setFiles(await cvAnalysisService.listFiles());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load files.');
      setFiles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { files, isLoading, error, reload };
}
