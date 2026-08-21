import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/apiClient';
import { paymentEndpoints } from './payment.endpoints';
import { paymentService } from './payment.service';

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn() },
}));

// Ví/credit là domain LIVE; ghim tường minh để bộ test không phụ thuộc việc
// jsdom có bị nhận nhầm là runtime Playwright hay không.
vi.mock('@/shared/mock', () => ({
  usesMockData: () => false,
  mockDelay: () => Promise.resolve(),
}));

/** Trả payload tài khoản cho `/me/account`, và danh sách giao dịch rỗng cho endpoint kia. */
function mockAccount(account: Record<string, unknown>): void {
  vi.mocked(apiClient.get).mockImplementation(((url: string) => {
    if (url === paymentEndpoints.walletAccount) return Promise.resolve({ data: account, headers: {} });
    if (url === paymentEndpoints.creditTransactions) return Promise.resolve({ data: [], headers: {} });
    throw new Error(`unexpected url: ${url}`);
  }) as unknown as typeof apiClient.get);
}

describe('paymentService.getWallet — suất dùng thử chờ cấp (PAY-14)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cộng suất dùng thử vào số credit khả dụng khi người dùng chưa có ví', async () => {
    mockAccount({ remainingCredits: 0, reservedCredits: 0, walletExists: false, pendingFreeCredits: 3 });

    const wallet = await paymentService.getWallet();

    expect(wallet.available).toBe(3);
    expect(wallet.balance).toBe(3);
    expect(wallet.reserved).toBe(0);
  });

  it('KHÔNG cộng lần hai khi ví đã tồn tại — suất đó đã nằm trong remainingCredits', async () => {
    mockAccount({ remainingCredits: 2, reservedCredits: 1, walletExists: true, pendingFreeCredits: 3 });

    const wallet = await paymentService.getWallet();

    expect(wallet.available).toBe(2);
    expect(wallet.balance).toBe(3);
    expect(wallet.reserved).toBe(1);
  });

  it('ví đã tồn tại và đã tiêu hết vẫn là 0 khả dụng', async () => {
    mockAccount({ remainingCredits: 0, reservedCredits: 0, walletExists: true, pendingFreeCredits: 3 });

    await expect(paymentService.getWallet()).resolves.toMatchObject({ available: 0, balance: 0 });
  });

  it('giữ bất biến balance = available + reserved khi ví chưa tồn tại', async () => {
    mockAccount({ remainingCredits: 0, reservedCredits: 0, walletExists: false, pendingFreeCredits: 3 });

    const wallet = await paymentService.getWallet();

    expect(wallet.balance).toBe(wallet.available + wallet.reserved);
  });

  it('payload thiếu walletExists thì KHÔNG tự cộng suất chờ (mặc định lùi an toàn)', async () => {
    // Backend cũ hơn không trả `walletExists`. Không xác nhận được là ví đang thiếu
    // thì bản parse phải im lặng giữ hành vi cũ, không bịa thêm credit.
    mockAccount({ remainingCredits: 5, reservedCredits: 0, pendingFreeCredits: 3 });

    const wallet = await paymentService.getWallet();

    expect(wallet.available).toBe(5);
    expect(wallet.balance).toBe(5);
  });

  it('payload cũ thiếu cả hai trường vẫn đọc được như trước', async () => {
    mockAccount({ remainingCredits: 4, reservedCredits: 2 });

    await expect(paymentService.getWallet()).resolves.toMatchObject({ available: 4, balance: 6, reserved: 2 });
  });
});
