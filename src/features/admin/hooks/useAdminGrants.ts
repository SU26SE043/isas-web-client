import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminPaymentService } from '../services/adminPayment.service';
import type { CreditGrantInput, SubscriptionGrantInput } from '../types/adminApi.types';
import { OWNER_TYPE_USER, PLAN_AUDIENCE_B2B, PLAN_AUDIENCE_B2C } from '../utils/adminBilling';
import { creditLedgerKey, adminWalletKey, postpaidOverviewKey } from './useAdminBilling';

export const adminPlansKey = (audience?: number) => ['admin-plans', audience ?? 'all'] as const;

/** Gói cấp được cho chủ ví này: Cá nhân ⇒ B2C, Tổ chức ⇒ B2B (BE 400 nếu lệch), chỉ gói đang bán. */
export function usePlansForOwner(ownerType: number) {
  const audience = ownerType === OWNER_TYPE_USER ? PLAN_AUDIENCE_B2C : PLAN_AUDIENCE_B2B;
  return useQuery({ queryKey: adminPlansKey(audience), queryFn: () => adminPaymentService.listPlans(audience), select: (plans) => plans.filter((plan) => plan.isActive), retry: 1 });
}

export function useGrantActions() {
  const queryClient = useQueryClient();
  const refreshWallet = (ownerType: number, ownerId: string) => Promise.all([
    queryClient.invalidateQueries({ queryKey: adminWalletKey(ownerId) }),
    queryClient.invalidateQueries({ queryKey: creditLedgerKey(ownerType, ownerId) }),
    queryClient.invalidateQueries({ queryKey: postpaidOverviewKey }),
  ]);
  const grantCredits = useMutation({ mutationFn: (input: CreditGrantInput) => adminPaymentService.grantCredits(input), onSuccess: (_result, input) => void refreshWallet(input.ownerType, input.ownerId) });
  const grantSubscription = useMutation({ mutationFn: (input: SubscriptionGrantInput) => adminPaymentService.grantSubscription(input) });
  return { grantCredits, grantSubscription };
}
