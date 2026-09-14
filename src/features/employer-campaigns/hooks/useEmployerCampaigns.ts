import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import {
  campaignManagementService,
  CampaignInvitationDeployError,
} from '../services/campaignManagement.service';
import type {
  CampaignDeployOptions,
  CampaignDeployResult,
  CampaignFilters,
  EmployerCampaign,
} from '../types/campaignManagement.types';
import type { CampaignCreateRequest } from '../types/campaign.api.types';

export const EMPLOYER_CAMPAIGNS_QUERY_KEY = ['employer', 'campaigns'] as const;
export const EMPLOYER_CAMPAIGN_DETAIL_QUERY_KEY = ['employer', 'campaign'] as const;

export function employerCampaignsQueryKey(filters: CampaignFilters) {
  return [...EMPLOYER_CAMPAIGNS_QUERY_KEY, filters.query, filters.status] as const;
}

/**
 * Deploy (publish + invite) từ wizard, rồi ĐỒNG BỘ cache chi tiết ngay.
 *
 * Vì sao: wizard seed cache chi tiết lúc tạo nháp (`create` bên dưới) và `staleTime` toàn cục là
 * 5 phút. Trước bản vá này wizard gọi thẳng service rồi `navigate` sang trang chi tiết ⇒ React Query
 * trả bản nháp còn "tươi" ⇒ HR thấy toast "Đã triển khai" cạnh badge "Bản nháp", banner "cần xuất
 * bản" và một nút "Triển khai" thứ hai (bấm lại là 409) — tới 5 phút hoặc tới khi F5. Đường `publish`
 * trong hook đã làm đúng; wizard chỉ không đi qua nó vì cần publish + mời trong một lượt.
 *
 * Deploy hụt ở bước mời (`CampaignInvitationDeployError`) thì campaign VẪN đã Active ⇒ cũng phải
 * ghi cache từ `error.campaign` rồi mới ném tiếp, kẻo rời wizard lúc đó lại thấy "Bản nháp".
 *
 * T13 R2: `options.startNow` đi thẳng xuống service; bản sync vào cache là `result.campaign` /
 * `error.campaign` — service đã đổi chúng sang bản ĐÃ start-now (startsAt=now) khi bước đó xong,
 * nên trang chi tiết không hiện banner "mở lúc <giờ cũ>" + nút "Mở ngay" thừa ngay sau deploy.
 */
export async function deployCampaignAndSyncCache(
  queryClient: QueryClient,
  campaignId: string,
  emails: string[],
  options?: CampaignDeployOptions,
): Promise<CampaignDeployResult> {
  const sync = (campaign: EmployerCampaign) => {
    queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), campaign);
    void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
  };
  try {
    const result = await campaignManagementService.deployCampaign(campaignId, emails, options);
    sync(result.campaign);
    return result;
  } catch (error) {
    if (error instanceof CampaignInvitationDeployError) sync(error.campaign);
    throw error;
  }
}

export function employerCampaignDetailQueryKey(id: string) {
  return [...EMPLOYER_CAMPAIGN_DETAIL_QUERY_KEY, id] as const;
}

export function useEmployerCampaigns(filters: CampaignFilters) {
  const { t } = useLanguage();
  const toastedRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: employerCampaignsQueryKey(filters),
    queryFn: () => campaignManagementService.listCampaigns(filters),
    retry: (failureCount, error) => {
      const status = campaignManagementService.getErrorStatus(error);
      if (status === 401 || status === 403) return false;
      return failureCount < 1;
    },
  });

  const errorStatus = query.isError
    ? campaignManagementService.getErrorStatus(query.error)
    : undefined;

  useEffect(() => {
    if (!query.isError) {
      toastedRef.current = null;
      return;
    }
    if (errorStatus === 401 || errorStatus === 403) return;

    const key = `${errorStatus ?? 'x'}-${query.errorUpdatedAt}`;
    if (toastedRef.current === key) return;
    toastedRef.current = key;
    toast.error(t('employer.campaigns.list.errorToast'));
  }, [errorStatus, query.errorUpdatedAt, query.isError, t]);

  return {
    campaigns: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    errorStatus,
    reload: () => {
      void query.refetch();
    },
  };
}

export function useEmployerCampaign(id: string | undefined) {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const toastedRef = useRef<string | null>(null);
  const detailQuery = useQuery({
    queryKey: employerCampaignDetailQueryKey(id ?? ''),
    queryFn: async () => {
      try {
        return await campaignManagementService.getCampaign(id!);
      } catch (error) {
        const status = campaignManagementService.getErrorStatus(error);
        // After Step 1 create we seed React Query; prefer cache so the wizard can continue.
        if (status === 400 || status === 404) {
          const cached = queryClient.getQueryData<EmployerCampaign>(
            employerCampaignDetailQueryKey(id!),
          );
          if (cached) return cached;
          const memory = campaignManagementService.getCachedCampaign(id!);
          if (memory) {
            queryClient.setQueryData(employerCampaignDetailQueryKey(id!), memory);
            return memory;
          }
        }
        throw error;
      }
    },
    enabled: Boolean(id),
    // Prefer data seeded by createCampaign before navigate → edit remount.
    initialData: () =>
      id
        ? queryClient.getQueryData<EmployerCampaign>(employerCampaignDetailQueryKey(id))
        : undefined,
    initialDataUpdatedAt: () =>
      id
        ? queryClient.getQueryState(employerCampaignDetailQueryKey(id))?.dataUpdatedAt
        : undefined,
    retry: (failureCount, error) => {
      const status = campaignManagementService.getErrorStatus(error);
      if (status === 401 || status === 403 || status === 404 || status === 400) return false;
      return failureCount < 1;
    },
  });

  const errorStatus = detailQuery.isError
    ? campaignManagementService.getErrorStatus(detailQuery.error)
    : undefined;

  useEffect(() => {
    if (!detailQuery.isError) {
      toastedRef.current = null;
      return;
    }
    if (errorStatus === 401 || errorStatus === 403 || errorStatus === 404 || errorStatus === 400) {
      return;
    }

    const key = `${errorStatus ?? 'x'}-${detailQuery.errorUpdatedAt}`;
    if (toastedRef.current === key) return;
    toastedRef.current = key;
    toast.error(t('employer.campaigns.detail.errorToast'));
  }, [detailQuery.errorUpdatedAt, detailQuery.isError, errorStatus, t]);

  const createCampaign = useCallback(
    async (input: CampaignCreateRequest) => {
      const next = await campaignManagementService.createCampaign(input);
      queryClient.setQueryData(employerCampaignDetailQueryKey(next.id), next);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return next;
    },
    [queryClient],
  );

  const updateCampaign = useCallback(
    async (campaignId: string, payload: import('../types/campaign.api.types').CampaignUpdateRequest) => {
      const next = await campaignManagementService.updateCampaign(campaignId, payload);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), next);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return next;
    },
    [queryClient],
  );

  const updateCampaignQuestions = useCallback(
    async (
      campaignId: string,
      questions: import('../types/campaign.api.types').CampaignCreateQuestionRequest[],
    ) => {
      const next = await campaignManagementService.updateCampaignQuestions(campaignId, questions);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), next);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return next;
    },
    [queryClient],
  );

  const uploadJdFile = useCallback(
    async (campaignId: string, jdFile: File) => {
      const next = await campaignManagementService.uploadCampaignFiles(campaignId, { jdFile });
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), next);
      return next;
    },
    [queryClient],
  );

  const uploadFiles = useCallback(
    async (
      campaignId: string,
      files: { jdFile?: File | null; criteriaFile?: File | null },
    ) => {
      const next = await campaignManagementService.uploadCampaignFiles(campaignId, files);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), next);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return next;
    },
    [queryClient],
  );

  const replaceFiles = useCallback(
    async (
      campaignId: string,
      files: { jdFile?: File | null; criteriaFile?: File | null },
    ) => {
      const next = await campaignManagementService.replaceCampaignFiles(campaignId, files);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), next);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return next;
    },
    [queryClient],
  );

  const downloadFile = useCallback(async (campaignId: string, fileType: 'jd' | 'criteria') => {
    return campaignManagementService.downloadCampaignFile(campaignId, fileType);
  }, []);

  const publish = useCallback(
    async (campaignId: string) => {
      const result = await campaignManagementService.publishCampaign(campaignId);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), result.campaign);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return result;
    },
    [queryClient],
  );

  const startNow = useCallback(
    async (campaignId: string) => {
      const next = await campaignManagementService.startCampaignNow(campaignId);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), next);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return next;
    },
    [queryClient],
  );

  const updateStatus = useCallback(
    async (
      campaignId: string,
      status: import('../types/campaign.api.types').CampaignStatusUpdateRequest['status'],
    ) => {
      const next = await campaignManagementService.updateCampaignStatus(campaignId, status);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), next);
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return next;
    },
    [queryClient],
  );

  const deleteCampaign = useCallback(
    async (campaignId: string) => {
      await campaignManagementService.deleteCampaign(campaignId);
      queryClient.removeQueries({ queryKey: employerCampaignDetailQueryKey(campaignId) });
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
    },
    [queryClient],
  );

  const invite = useCallback(
    async (campaignId: string, emails: string[]) => {
      const result = await campaignManagementService.inviteCandidates(campaignId, emails);
      queryClient.setQueryData(employerCampaignDetailQueryKey(campaignId), result.campaign);
      void queryClient.invalidateQueries({ queryKey: employerCampaignDetailQueryKey(campaignId) });
      void queryClient.invalidateQueries({ queryKey: EMPLOYER_CAMPAIGNS_QUERY_KEY });
      return result;
    },
    [queryClient],
  );

  return {
    campaign: (detailQuery.data as EmployerCampaign | undefined) ?? null,
    isLoading: Boolean(id) && detailQuery.isLoading,
    isError: detailQuery.isError,
    errorStatus,
    reload: () => {
      void detailQuery.refetch();
    },
    createCampaign,
    updateCampaign,
    updateCampaignQuestions,
    uploadJdFile,
    uploadFiles,
    replaceFiles,
    downloadFile,
    publish,
    startNow,
    updateStatus,
    deleteCampaign,
    invite,
  };
}
