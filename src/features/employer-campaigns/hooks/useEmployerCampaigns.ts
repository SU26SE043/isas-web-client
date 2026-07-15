import { useCallback, useEffect, useState } from 'react';
import { campaignManagementService } from '../services/campaignManagement.service';
import type {
  CampaignDraftInput,
  CampaignFilters,
  CampaignQuestion,
  EmployerCampaign,
} from '../types/campaignManagement.types';

export function useEmployerCampaigns(filters: CampaignFilters) {
  const [campaigns, setCampaigns] = useState<EmployerCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setCampaigns(await campaignManagementService.listCampaigns(filters));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { campaigns, isLoading, reload };
}

export function useEmployerCampaign(id: string | undefined) {
  const [campaign, setCampaign] = useState<EmployerCampaign | null>(null);
  const [questions, setQuestions] = useState<CampaignQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextCampaign, nextQuestions] = await Promise.all([
        id ? campaignManagementService.getCampaign(id) : Promise.resolve(null),
        campaignManagementService.listQuestions(),
      ]);
      setCampaign(nextCampaign);
      setQuestions(nextQuestions);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const saveDraft = useCallback(async (input: CampaignDraftInput, draftId?: string) => {
    const next = await campaignManagementService.saveDraft(input, draftId);
    setCampaign(next);
    return next;
  }, []);

  const publish = useCallback(async (campaignId: string) => {
    const result = await campaignManagementService.publishCampaign(campaignId);
    setCampaign(result.campaign);
    return result;
  }, []);

  const invite = useCallback(async (campaignId: string, emails: string[]) => {
    const result = await campaignManagementService.inviteCandidates(campaignId, emails);
    setCampaign(result.campaign);
    return result;
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { campaign, questions, isLoading, reload, saveDraft, publish, invite };
}
