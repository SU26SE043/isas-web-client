import { useCallback, useEffect, useState } from 'react';
import { employerBillingService } from '../services/employerBilling.service';
import type {
  BillingCycle,
  CampaignTokenUsage,
  EmployerBillingAccount,
  EmployerInvoice,
  InvoiceGenerationResult,
  MonthlyUsagePeriod,
  OrgPlanId,
  PaymentMethodInput,
  SessionTokenUsage,
  SubscriptionPlan,
} from '../types/employerBilling.types';

export function useEmployerBilling() {
  const [account, setAccount] = useState<EmployerBillingAccount | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<EmployerInvoice[]>([]);
  const [campaignUsage, setCampaignUsage] = useState<CampaignTokenUsage[]>([]);
  const [monthlyUsage, setMonthlyUsage] = useState<MonthlyUsagePeriod[]>([]);
  const [sessionsByCampaign, setSessionsByCampaign] = useState<Record<string, SessionTokenUsage[]>>({});
  const [loadingCampaignId, setLoadingCampaignId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextAccount, nextPlans, nextInvoices, nextCampaignUsage, nextMonthlyUsage] = await Promise.all([
        employerBillingService.getBillingAccount(),
        employerBillingService.getPlans(),
        employerBillingService.listInvoices(),
        employerBillingService.getCampaignUsage(),
        employerBillingService.getMonthlyUsage(),
      ]);
      setAccount(nextAccount);
      setPlans(nextPlans);
      setInvoices(nextInvoices);
      setCampaignUsage(nextCampaignUsage);
      setMonthlyUsage(nextMonthlyUsage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectPlan = useCallback(async (planId: OrgPlanId, cycle: BillingCycle) => {
    const result = await employerBillingService.selectPlan(planId, cycle);
    setAccount(result.account);
    setInvoices((items) => [result.invoice, ...items]);
    return result;
  }, []);

  const savePaymentMethod = useCallback(async (input: PaymentMethodInput) => {
    const next = await employerBillingService.savePaymentMethod(input);
    setAccount(next);
    return next;
  }, []);

  const generateInvoicePdf = useCallback(async (invoiceId: string): Promise<InvoiceGenerationResult> => {
    const result = await employerBillingService.generateInvoicePdf(invoiceId);
    setInvoices((items) => items.map((invoice) => (invoice.id === result.invoice.id ? result.invoice : invoice)));
    return result;
  }, []);

  const loadCampaignSessions = useCallback(async (campaignId: string) => {
    if (sessionsByCampaign[campaignId]) return;
    setLoadingCampaignId(campaignId);
    try {
      const sessions = await employerBillingService.getSessionUsage(campaignId);
      setSessionsByCampaign((current) => ({ ...current, [campaignId]: sessions }));
    } finally {
      setLoadingCampaignId(null);
    }
  }, [sessionsByCampaign]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    account,
    plans,
    invoices,
    campaignUsage,
    monthlyUsage,
    sessionsByCampaign,
    loadingCampaignId,
    isLoading,
    reload,
    selectPlan,
    savePaymentMethod,
    generateInvoicePdf,
    loadCampaignSessions,
  };
}
