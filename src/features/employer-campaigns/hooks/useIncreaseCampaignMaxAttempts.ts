import { useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignManagementService } from '../services/campaignManagement.service';
import { buildIncreaseMaxAttemptsRequest } from '../utils/campaignAttemptRulesUpdate';
import { EMPLOYER_CAMPAIGNS_QUERY_KEY, employerCampaignDetailQueryKey } from './useEmployerCampaigns';

/**
 * ATT1-F2 [C2] — tăng `maxAttempts` của chiến dịch đang Active từ trang chi tiết.
 * Body đúng `{ title, maxAttempts }` (xem `buildIncreaseMaxAttemptsRequest`). Thành công ⇒ invalidate
 * chi tiết (`['employer','campaign',id]`) + mọi trang danh sách (`['employer','campaigns',…]`); trả về
 * promise invalidate để `mutateAsync` chỉ xong khi thẻ đã có số mới.
 */
export function useIncreaseCampaignMaxAttempts(campaignId: string, title: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (maxAttempts: number) =>
      campaignManagementService.updateCampaign(campaignId, buildIncreaseMaxAttemptsRequest(title, maxAttempts)),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: employerCampaignDetailQueryKey(campaignId) }),
        queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY }),
      ]),
  });
}
