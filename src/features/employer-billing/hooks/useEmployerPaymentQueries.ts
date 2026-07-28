import { useQuery } from '@tanstack/react-query';
import { employerPaymentService } from '../services/employerPayment.service';
import { employerPaymentKeys } from './employerPayment.keys';

export function useEmployerPaymentAccount() {
  return useQuery({
    queryKey: employerPaymentKeys.account(),
    queryFn: employerPaymentService.getPaymentAccount,
    retry: false,
  });
}

export function useEmployerSubscription() {
  return useQuery({
    queryKey: employerPaymentKeys.subscription(),
    queryFn: employerPaymentService.getMySubscription,
    retry: false,
  });
}

export function useEmployerPackages() {
  return useQuery({
    queryKey: employerPaymentKeys.packages(),
    queryFn: employerPaymentService.getPackages,
    staleTime: 60_000,
    retry: false,
  });
}

export function useEmployerPackage(id: string | null) {
  return useQuery({
    queryKey: employerPaymentKeys.package(id ?? ''),
    queryFn: () => employerPaymentService.getPackageById(id!),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useEmployerOrders(cursor: string | null, limit = 20) {
  return useQuery({
    queryKey: employerPaymentKeys.orderList(cursor, limit),
    queryFn: () => employerPaymentService.getMyOrders({ cursor, limit }),
    retry: false,
  });
}

export function useEmployerOrder(id: string | null) {
  return useQuery({
    queryKey: employerPaymentKeys.order(id ?? ''),
    queryFn: () => employerPaymentService.getMyOrderById(id!),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useEmployerTransactions(cursor: string | null, limit = 20) {
  return useQuery({
    queryKey: employerPaymentKeys.transactionList(cursor, limit),
    queryFn: () => employerPaymentService.getCreditTransactions({ cursor, limit }),
    retry: false,
  });
}

