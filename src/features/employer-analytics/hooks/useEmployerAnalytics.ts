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

export function useEmployerCandidate(candidateId: string | undefined, campaignId: string | undefined) {
  const [candidate, setCandidate] = useState<PipelineCandidate | null>(null);
  const [report, setReport] = useState<CandidateReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!candidateId || !campaignId) return;
    setIsLoading(true);
    try {
      const [nextCandidate, nextReport] = await Promise.all([
        employerAnalyticsService.getCandidate(campaignId, candidateId),
        employerAnalyticsService.getCandidateReport(campaignId, candidateId),
      ]);
      setCandidate(nextCandidate);
      setReport(nextReport);
    } finally {
      setIsLoading(false);
    }
  }, [candidateId, campaignId]);

  const overrideScore = useCallback(async (score: number, note: string) => {
    if (!candidateId || !campaignId) throw new Error('CANDIDATE_REQUIRED');
    const next = await employerAnalyticsService.overrideCandidateScore(campaignId, candidateId, score, note);
    setReport(next);
    return next;
  }, [candidateId, campaignId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { candidate, report, isLoading, reload, overrideScore };
}

export function useEmployerAnalytics(campaignId: string | undefined, filters: AnalyticsFilters) {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!campaignId) return;
      setAnalytics(await employerAnalyticsService.getAnalytics(campaignId, filters));
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, filters]);

  const exportAnalytics = useCallback((format: ExportFormat, rowCount: number) => {
    if (!campaignId) throw new Error('CAMPAIGN_ID_REQUIRED');
    return employerAnalyticsService.exportAnalytics(campaignId, format, rowCount);
  }, [campaignId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { analytics, isLoading, reload, exportAnalytics };
}
