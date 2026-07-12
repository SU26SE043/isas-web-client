import { useCallback, useEffect, useState } from 'react';
import { employerAnalyticsService } from '../services/employerAnalytics.service';
import type { AnalyticsFilters, AnalyticsSnapshot, CandidateReport, ExportFormat, PipelineCandidate, PipelineFilters } from '../types/employerAnalytics.types';

export function usePipelineCandidates(campaignId: string | undefined, filters: PipelineFilters) {
  const [candidates, setCandidates] = useState<PipelineCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!campaignId) return;
    setIsLoading(true);
    try {
      setCandidates(await employerAnalyticsService.listPipelineCandidates(campaignId, filters));
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, filters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { candidates, isLoading, reload };
}

export function useEmployerCandidate(candidateId: string | undefined) {
  const [candidate, setCandidate] = useState<PipelineCandidate | null>(null);
  const [report, setReport] = useState<CandidateReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!candidateId) return;
    setIsLoading(true);
    try {
      const [nextCandidate, nextReport] = await Promise.all([
        employerAnalyticsService.getCandidate(candidateId),
        employerAnalyticsService.getCandidateReport(candidateId),
      ]);
      setCandidate(nextCandidate);
      setReport(nextReport);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId]);

  const overrideScore = useCallback(async (score: number, note: string) => {
    if (!candidateId) throw new Error('CANDIDATE_REQUIRED');
    const next = await employerAnalyticsService.overrideCandidateScore(candidateId, score, note);
    setReport(next);
    return next;
  }, [candidateId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { candidate, report, isLoading, reload, overrideScore };
}

export function useEmployerAnalytics(filters: AnalyticsFilters) {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setAnalytics(await employerAnalyticsService.getAnalytics(filters));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const exportAnalytics = useCallback((format: ExportFormat, rowCount: number) => employerAnalyticsService.exportAnalytics(format, rowCount), []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { analytics, isLoading, reload, exportAnalytics };
}
