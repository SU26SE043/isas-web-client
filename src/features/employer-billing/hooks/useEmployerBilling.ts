import { useCallback, useEffect, useState } from 'react';
import { employerBillingService } from '../services/employerBilling.service';
import type {
  BillingCycle,
  EmployerBillingAccount,
  EmployerInvoice,
  InvoiceGenerationResult,
  OrgPlanId,
  PaymentMethodInput,
  SubscriptionPlan,
} from '../types/employerBilling.types';

export function useEmployerBilling() {
  const [account, setAccount] = useState<EmployerBillingAccount | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [invoices, setInvoices] = useState<EmployerInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nextAccount, nextPlans, nextInvoices] = await Promise.all([
        employerBillingService.getBillingAccount(),
        employerBillingService.getPlans(),
        employerBillingService.listInvoices(),
      ]);
      setAccount(nextAccount);
      setPlans(nextPlans);
      setInvoices(nextInvoices);
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

  useEffect(() => {
    void reload();
  }, [reload]);

  return { account, plans, invoices, isLoading, reload, selectPlan, savePaymentMethod, generateInvoicePdf };
}
