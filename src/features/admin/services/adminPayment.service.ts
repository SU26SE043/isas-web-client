import { apiClient } from '@/shared/api/apiClient';
import { readNextCursorHeader } from '../utils/adminCampaignsApi';
import type { AdminApiPage, AdminAiUsageAnalytics, AdminOrder, AdminOrderParams, AdminRevenueAnalytics, AdminTrafficAnalytics, CreditAccount, CreditGrantInput, CreditTransaction, Package, PackageInput, PaymentModeInput, Plan, PlanInput, RefundInput, RefundSettleInput, SubscriptionGrantInput } from '../types/adminApi.types';
import { adminApiEndpoints } from './adminApi.endpoints';

const list = <T>(data: unknown): T[] => Array.isArray(data) ? data as T[] : ((data as { data?: T[]; items?: T[] } | null)?.data ?? (data as { items?: T[] } | null)?.items ?? []);
const page = <T>(data: unknown, headers: unknown): AdminApiPage<T> => ({ items: list<T>(data), nextCursor: readNextCursorHeader(headers) });
const reportParams = (params: { from?: string; to?: string; groupBy?: string }) => ({ ...(params.from?.trim() ? { from: params.from.trim() } : {}), ...(params.to?.trim() ? { to: params.to.trim() } : {}), ...(params.groupBy ? { groupBy: params.groupBy } : {}) });

export const adminPaymentService = {
  listOrders: async (params: AdminOrderParams = {}) => { const response = await apiClient.get(adminApiEndpoints.orders, { params }); return page<AdminOrder>(response.data, response.headers); },
  listPackages: async () => list<Package>((await apiClient.get(adminApiEndpoints.packages)).data),
  getPackage: async (id: string) => (await apiClient.get<Package>(adminApiEndpoints.package(id))).data,
  createPackage: async (input: PackageInput) => (await apiClient.post<Package>(adminApiEndpoints.packages, input)).data,
  updatePackage: async (id: string, input: Partial<PackageInput>) => (await apiClient.put<Package>(adminApiEndpoints.package(id), input)).data,
  deletePackage: async (id: string) => { await apiClient.delete(adminApiEndpoints.package(id)); },
  closeInvoice: async (input: { orgId: string; periodStart?: string; periodEnd?: string }) => (await apiClient.post(adminApiEndpoints.invoicesClose, input)).data,
  refundOrder: async (id: string, input: RefundInput) => (await apiClient.post(adminApiEndpoints.refund(id), input)).data,
  settleRefund: async (id: string, input: RefundSettleInput = {}) => (await apiClient.post(adminApiEndpoints.refundSettle(id), input)).data,
  payoutRefund: async (id: string) => (await apiClient.post(adminApiEndpoints.refundPayout(id))).data,
  getRevenue: async (params: { from?: string; to?: string; groupBy?: 'day' | 'month' } = {}) => (await apiClient.get<AdminRevenueAnalytics>(adminApiEndpoints.revenue, { params: reportParams(params) })).data,
  getAiUsage: async (params: { from?: string; to?: string; groupBy?: 'day' | 'month' } = {}) => (await apiClient.get<AdminAiUsageAnalytics>(adminApiEndpoints.aiUsage, { params: reportParams(params) })).data,
  getTraffic: async (params: { from?: string; to?: string; groupBy?: 'hour' | 'day' } = {}) => (await apiClient.get<AdminTrafficAnalytics>(adminApiEndpoints.traffic, { params: reportParams(params) })).data,
  grantCredits: async (input: CreditGrantInput) => (await apiClient.post(adminApiEndpoints.grantCredits, input)).data,
  setPaymentMode: async (input: PaymentModeInput) => {
    const ownerId = input.ownerId.trim();
    const note = input.note.trim();
    if (input.ownerType !== 0) throw new Error('PAYMENT_MODE_ORG_ONLY');
    if (!ownerId) throw new Error('OWNER_ID_REQUIRED');
    if (!note) throw new Error('PAYMENT_MODE_NOTE_REQUIRED');
    if (input.paymentMode === 1 && (!Number.isFinite(input.creditLimit) || (input.creditLimit ?? 0) <= 0)) {
      throw new Error('CREDIT_LIMIT_REQUIRED');
    }
    return (await apiClient.post(adminApiEndpoints.paymentMode, {
      ...input,
      ownerId,
      note,
      ...(input.paymentMode === 1 ? { creditLimit: input.creditLimit } : {}),
    })).data;
  },
  getCreditAccount: async (ownerType: number, ownerId: string) => (await apiClient.get<CreditAccount>(adminApiEndpoints.creditAccount(ownerType, ownerId))).data,
  getCreditTransactions: async (ownerType: number, ownerId: string, params: { reason?: number; cursor?: string; limit?: number } = {}) => { const response = await apiClient.get(adminApiEndpoints.creditTransactions(ownerType, ownerId), { params }); return page<CreditTransaction>(response.data, response.headers); },
  grantSubscription: async (input: SubscriptionGrantInput) => (await apiClient.post(adminApiEndpoints.grantSubscription, input)).data,
  listPlans: async (audience?: number) => list<Plan>((await apiClient.get(adminApiEndpoints.plans, { params: audience === undefined ? undefined : { audience } })).data),
  getPlan: async (id: string) => (await apiClient.get<Plan>(adminApiEndpoints.plan(id))).data,
  createPlan: async (input: PlanInput) => (await apiClient.post<Plan>(adminApiEndpoints.plans, input)).data,
  updatePlan: async (id: string, input: PlanInput) => (await apiClient.put<Plan>(adminApiEndpoints.plan(id), input)).data,
  deletePlan: async (id: string) => { await apiClient.delete(adminApiEndpoints.plan(id)); },
};
