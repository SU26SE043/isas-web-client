export const employerPaymentKeys = {
  all: ['employer-payment'] as const,
  packages: () => [...employerPaymentKeys.all, 'packages'] as const,
  package: (id: string) => [...employerPaymentKeys.packages(), id] as const,
  account: () => [...employerPaymentKeys.all, 'account'] as const,
  subscription: () => [...employerPaymentKeys.all, 'subscription'] as const,
  orders: () => [...employerPaymentKeys.all, 'orders'] as const,
  orderList: (cursor: string | null, limit: number) =>
    [...employerPaymentKeys.orders(), 'list', cursor, limit] as const,
  order: (id: string) => [...employerPaymentKeys.orders(), 'detail', id] as const,
  orderStatus: (id: string) => [...employerPaymentKeys.orders(), 'status', id] as const,
  transactions: () => [...employerPaymentKeys.all, 'transactions'] as const,
  transactionList: (cursor: string | null, limit: number) =>
    [...employerPaymentKeys.transactions(), 'list', cursor, limit] as const,
};

