import { useCallback, useEffect, useState } from 'react';
import { campaignService } from '../services/campaign.service';
import type { Campaign, CampaignFilters, CampaignInvite } from '../types/campaign.types';

export function useCampaigns(filters: CampaignFilters) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    void campaignService.listCampaigns(filters).then((data) => {
      if (active) {
        setCampaigns(data);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [filters]);

  return { campaigns, isLoading };
}

export function useCampaign(id: string | undefined) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setCampaign(await campaignService.getCampaign(id));
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  return { campaign, isLoading, reload: load };
}

export function useCampaignInvite(token: string | undefined) {
  const [invite, setInvite] = useState<(CampaignInvite & { campaign: Campaign }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!token) return;
    setIsLoading(true);
    void campaignService.validateInvite(token).then((data) => {
      if (active) {
        setInvite(data);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [token]);

  return { invite, isLoading };
}
