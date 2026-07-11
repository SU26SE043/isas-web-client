import { mockDelay, usesMockData } from '@/shared/mock';
import type {
  CompleteOrderResult,
  CreateOrderResult,
  CreditPackage,
  PaymentOrder,
  SubscriptionPlan,
  WalletSnapshot,
} from '../types/payment.types';
import {
  INITIAL_WALLET_BALANCE,
  MOCK_CREDIT_PACKAGES,
  MOCK_SUBSCRIPTION_PLANS,
  MOCK_WALLET_TRANSACTIONS,
} from '../mocks/payment.fixtures';

let walletBalance = INITIAL_WALLET_BALANCE;
const transactions = [...MOCK_WALLET_TRANSACTIONS];
const pendingOrders = new Map<string, PaymentOrder>();
const consumedSessions = new Set<string>();

function buildCheckoutUrl(orderId: string): string {
  return `/payment/callback?orderId=${encodeURIComponent(orderId)}&status=PAID`;
}

function findPackage(packageId: string): CreditPackage | SubscriptionPlan | undefined {
  return (
    MOCK_CREDIT_PACKAGES.find((item) => item.id === packageId) ??
    MOCK_SUBSCRIPTION_PLANS.find((item) => item.id === packageId)
  );
}

function resolveCredits(packageId: string): number {
  const creditPackage = MOCK_CREDIT_PACKAGES.find((item) => item.id === packageId);
  if (creditPackage) return creditPackage.credits;
  const subscription = MOCK_SUBSCRIPTION_PLANS.find((item) => item.id === packageId);
  if (subscription) return subscription.creditsPerMonth;
  return 0;
}

function resolvePrice(packageId: string): number {
  const creditPackage = MOCK_CREDIT_PACKAGES.find((item) => item.id === packageId);
  if (creditPackage) return creditPackage.priceUsd;
  const subscription = MOCK_SUBSCRIPTION_PLANS.find((item) => item.id === packageId);
  if (subscription) return subscription.priceUsdMonthly;
  return 0;
}

function resolveNames(packageId: string): { name: string; nameVi: string } {
  const item = findPackage(packageId);
  if (!item) return { name: packageId, nameVi: packageId };
  return { name: item.name, nameVi: item.nameVi };
}

export const paymentService = {
  async getWallet(): Promise<WalletSnapshot> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(300);
    return {
      balance: walletBalance,
      transactions: [...transactions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    };
  },

  getBalance(): number {
    return walletBalance;
  },

  async listPackages(): Promise<CreditPackage[]> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(250);
    return MOCK_CREDIT_PACKAGES;
  },

  async listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(250);
    return MOCK_SUBSCRIPTION_PLANS;
  },

  async createOrder(packageId: string): Promise<CreateOrderResult> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    const credits = resolveCredits(packageId);
    const amountUsd = resolvePrice(packageId);
    const names = resolveNames(packageId);

    if (credits <= 0) {
      throw new Error('PACKAGE_NOT_FOUND');
    }

    await mockDelay(500);

    const orderId = `order-${crypto.randomUUID().slice(0, 8)}`;
    const order: PaymentOrder = {
      orderId,
      packageId,
      packageName: names.name,
      packageNameVi: names.nameVi,
      credits,
      amountUsd,
      status: 'pending',
      checkoutUrl: buildCheckoutUrl(orderId),
      createdAt: new Date().toISOString(),
    };

    pendingOrders.set(orderId, order);
    return { order };
  },

  async getOrder(orderId: string): Promise<PaymentOrder | null> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(200);
    return pendingOrders.get(orderId) ?? null;
  },

  async completeOrder(orderId: string, status: 'PAID' | 'FAILED' | 'CANCELLED'): Promise<CompleteOrderResult> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    await mockDelay(800);

    const order = pendingOrders.get(orderId);
    if (!order) {
      throw new Error('ORDER_NOT_FOUND');
    }

    if (status !== 'PAID') {
      order.status = status === 'FAILED' ? 'failed' : 'cancelled';
      pendingOrders.set(orderId, order);
      return {
        order,
        wallet: {
          balance: walletBalance,
          transactions: [...transactions],
        },
      };
    }

    order.status = 'paid';
    walletBalance += order.credits;
    const isSubscription = order.packageId.startsWith('sub-');

    transactions.unshift({
      id: `tx-${crypto.randomUUID().slice(0, 8)}`,
      type: isSubscription ? 'subscription' : 'purchase',
      amount: order.amountUsd,
      creditsDelta: order.credits,
      description: `${order.packageName} purchase`,
      descriptionVi: `Mua ${order.packageNameVi}`,
      createdAt: new Date().toISOString(),
      status: 'completed',
    });

    pendingOrders.delete(orderId);

    return {
      order,
      wallet: {
        balance: walletBalance,
        transactions: [...transactions],
      },
    };
  },

  async consumeCredit(sessionId: string): Promise<number> {
    if (!usesMockData('payment')) {
      throw new Error('Payment API is not wired yet. Keep usesMockData("payment") true.');
    }

    if (consumedSessions.has(sessionId)) {
      return walletBalance;
    }

    if (walletBalance <= 0) {
      throw new Error('no_credits');
    }

    await mockDelay(200);
    walletBalance -= 1;
    consumedSessions.add(sessionId);

    transactions.unshift({
      id: `tx-${crypto.randomUUID().slice(0, 8)}`,
      type: 'consumption',
      amount: 0,
      creditsDelta: -1,
      description: 'Practice interview session',
      descriptionVi: 'Phien luyen phong van',
      createdAt: new Date().toISOString(),
      status: 'completed',
    });

    return walletBalance;
  },
};
