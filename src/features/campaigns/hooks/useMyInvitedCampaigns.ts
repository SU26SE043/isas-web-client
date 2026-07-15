import { useCallback, useEffect, useState } from 'react';
import { campaignService } from '../services/campaign.service';
import type { CandidateCampaignInvite } from '../types/campaign.types';

export function useMyInvitedCampaigns(candidateEmail?: string) {
  const [invites, setInvites] = useState<CandidateCampaignInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!candidateEmail) {
      setInvites([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      setInvites(await campaignService.listMyInvitedCampaigns(candidateEmail));
    } finally {
      setIsLoading(false);
    }
  }, [candidateEmail]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { invites, isLoading, reload };
}
