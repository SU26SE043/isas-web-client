import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiStatusCode } from '@/shared/api/apiError';
import { adminPaymentService } from '../services/adminPayment.service';
import type { PostpaidOverviewRow } from '../types/adminApi.types';
import { OWNER_TYPE_ORG } from '../utils/adminBilling';

export const adminWalletKey = (orgId: string) => ['admin-wallet', OWNER_TYPE_ORG, orgId] as const;
export const postpaidOverviewKey = ['admin-postpaid-overview'] as const;
export const creditLedgerKey = (ownerType: number, ownerId: string) => ['admin-credit-ledger', ownerType, ownerId] as const;
const LEDGER_PAGE = 20;

const retryUnlessAuth = (count: number, error: unknown) => {
  const status = getApiStatusCode(error);
  return status === 401 || status === 403 ? false : count < 2;
};

export function useAdminWallet(orgId: string) {
  return useQuery({ queryKey: adminWalletKey(orgId), queryFn: () => adminPaymentService.getCreditAccount(OWNER_TYPE_ORG, orgId), enabled: Boolean(orgId), retry: retryUnlessAuth });
}

/** Worklist postpaid — sort MỨC KHẨN trước (`alertLevel` số tăng theo mức khẩn), rồi tiền kỳ này giảm dần. */
export function sortPostpaidRows(rows: PostpaidOverviewRow[]): PostpaidOverviewRow[] {
  return [...rows].sort((a, b) => (b.alertLevel ?? 0) - (a.alertLevel ?? 0) || b.pendingAmountVnd - a.pendingAmountVnd);
}

export function usePostpaidOverview() {
  return useQuery({ queryKey: postpaidOverviewKey, queryFn: adminPaymentService.getPostpaidOverview, select: sortPostpaidRows, retry: retryUnlessAuth });
}

/** Sổ cái ví bất kỳ — keyset (body mảng + `X-Next-Cursor`), nạp thêm bằng nút "Xem thêm". */
export function useCreditLedger(ownerType: number, ownerId: string) {
  return useInfiniteQuery({
    queryKey: creditLedgerKey(ownerType, ownerId),
    queryFn: ({ pageParam }) => adminPaymentService.getCreditTransactions(ownerType, ownerId, { limit: LEDGER_PAGE, ...(pageParam ? { cursor: pageParam } : {}) }),
    initialPageParam: '' as string,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: Boolean(ownerId),
    retry: retryUnlessAuth,
  });
}

/** Hai mutation tiền của trang; xong thì làm mới ví + worklist + sổ cái (chốt kỳ đổi period_usage, đổi mode đổi badge). */
export function useBillingActions(orgId: string) {
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminWalletKey(orgId) }),
    queryClient.invalidateQueries({ queryKey: postpaidOverviewKey }),
    queryClient.invalidateQueries({ queryKey: creditLedgerKey(OWNER_TYPE_ORG, orgId) }),
  ]);
  const setMode = useMutation({
    mutationFn: (input: { paymentMode: number; creditLimit?: number; note: string; allowStrandedCredits: boolean }) => adminPaymentService.setPaymentMode({ ownerType: OWNER_TYPE_ORG, ownerId: orgId, ...input }),
    onSuccess: () => void refresh(),
  });
  const closeInvoice = useMutation({
    mutationFn: (input: { periodStart?: string; periodEnd?: string }) => adminPaymentService.closeInvoice({ orgId, ...input }),
    onSuccess: () => void refresh(),
  });
  return { setMode, closeInvoice };
}
