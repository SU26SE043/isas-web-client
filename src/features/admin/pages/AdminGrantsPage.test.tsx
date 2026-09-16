// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminDirectoryService } from '../services/adminDirectory.service';
import { adminPaymentService } from '../services/adminPayment.service';
import type { PlanWithEntitlements, SubscriptionGrantResult } from '../types/adminApi.types';
import { AdminGrantsPage } from './AdminGrantsPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));

const ORG = '0610da24-1111-2222-3333-444444444444';
// Shape `PlanResponse` (Payment): audience 1=B2B, interviewFunding 0=Credit.
const business: PlanWithEntitlements = { id: 'p-biz', audience: 1, code: 'business', name: 'Business', rank: 2, interviewFunding: 0, monthlyQuota: null, adaptiveEnabled: true, adaptiveMaxQuestions: null, adaptiveMaxFollowups: null, groundingEnabled: true, selfConsistencyN: 1, cvAnalysisIncluded: true, repoAnalysisIncluded: false, roadmapEnabled: false, maxQuestionsCap: null, maxActiveCampaigns: 10, maxCandidatesCap: 200, postpaidEligible: true, seatCount: 5, entitlementsVersion: 1, isActive: true };
const retired: PlanWithEntitlements = { ...business, id: 'p-old', code: 'legacy', name: 'Legacy', isActive: false };
const subResult: SubscriptionGrantResult = { id: 's1', ownerType: 0, ownerId: ORG, planId: 'p-biz', audience: 1, tierCode: 'business', tierRank: 2, interviewFunding: 0, monthlyQuota: null, source: 1, status: 0, activatedAt: '2026-09-16T00:00:00Z', expiresAt: '2026-10-16T00:00:00Z' };
const axios400 = (message: string) => new AxiosError('x', 'ERR', undefined, undefined, { status: 400, statusText: '', data: { message }, headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() } });

const renderPage = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter><AdminGrantsPage /></MemoryRouter></QueryClientProvider>);
const pickOrg = async (index = 0) => {
  const selects = await screen.findAllByLabelText('admin.picker.org.label');
  await waitFor(() => expect((selects[index] as HTMLSelectElement).options.length).toBe(2));
  fireEvent.change(selects[index], { target: { value: ORG } });
};
beforeEach(() => { vi.spyOn(adminDirectoryService, 'getAdminOrganizations').mockResolvedValue({ items: [{ id: ORG, name: 'ISAS Demo Co', createdAt: '2026-07-01T00:00:00Z', memberCount: 1 }], nextCursor: null }); vi.spyOn(adminPaymentService, 'listPlans').mockResolvedValue([business, retired]); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminGrantsPage — cấp credit', () => {
  it('nút tắt tới khi đủ (chủ ví · 1..10000 · lý do ≥3); bấm ⇒ CONFIRM nêu số + tên, chưa gọi API; xác nhận ⇒ POST kèm idempotencyKey UUID; kết quả +n/ví còn; form reset', async () => {
    const spy = vi.spyOn(adminPaymentService, 'grantCredits').mockResolvedValue({ ownerType: 0, ownerId: ORG, creditsGranted: 5, remainingCredits: 47, transactionId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' });
    renderPage();
    const submit = screen.getByRole('button', { name: 'admin.grants.credit.submit' });
    expect(submit).toBeDisabled();
    await pickOrg(0);
    fireEvent.change(screen.getByLabelText('admin.grants.credit.amount'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('admin.grants.note'), { target: { value: 'Đền bù sự cố' } });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    expect(await screen.findByText('admin.grants.credit.confirmTitle')).toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
    fireEvent.click(screen.getAllByRole('button', { name: 'admin.grants.credit.submit' }).at(-1)!);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    const payload = spy.mock.calls[0][0];
    expect(payload).toMatchObject({ ownerType: 0, ownerId: ORG, credits: 5, note: 'Đền bù sự cố' });
    expect(payload.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
    expect(await screen.findByText('+5')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByLabelText('admin.grants.note')).toHaveValue('');
  });

  it('bấm lại khi form chưa đổi ⇒ CÙNG khoá (không cấp 2 lần); đổi số credit ⇒ khoá KHÁC (BE không xét credits — Q14)', async () => {
    const spy = vi.spyOn(adminPaymentService, 'grantCredits').mockRejectedValue(new Error('network'));
    renderPage();
    await pickOrg(0);
    fireEvent.change(screen.getByLabelText('admin.grants.credit.amount'), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText('admin.grants.note'), { target: { value: 'Đền bù sự cố' } });
    const go = async () => { fireEvent.click(screen.getByRole('button', { name: 'admin.grants.credit.submit' })); fireEvent.click((await screen.findAllByRole('button', { name: 'admin.grants.credit.submit' })).at(-1)!); };
    await go(); await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    await go(); await waitFor(() => expect(spy).toHaveBeenCalledTimes(2));
    expect(spy.mock.calls[1][0].idempotencyKey).toBe(spy.mock.calls[0][0].idempotencyKey);
    fireEvent.change(screen.getByLabelText('admin.grants.credit.amount'), { target: { value: '6' } });
    await go(); await waitFor(() => expect(spy).toHaveBeenCalledTimes(3));
    expect(spy.mock.calls[2][0].idempotencyKey).not.toBe(spy.mock.calls[0][0].idempotencyKey);
  });
});

describe('AdminGrantsPage — cấp thuê bao', () => {
  it('Tổ chức ⇒ hỏi gói audience=1 (B2B), chỉ gói đang bán; confirm ⇒ POST đúng payload; kết quả hiện tier/từ→đến/Cấp tay', async () => {
    const plansSpy = vi.spyOn(adminPaymentService, 'listPlans');
    const spy = vi.spyOn(adminPaymentService, 'grantSubscription').mockResolvedValue(subResult);
    renderPage();
    await waitFor(() => expect(plansSpy).toHaveBeenCalledWith(1));
    await pickOrg(1);
    const planSelect = screen.getByLabelText('admin.grants.sub.plan') as HTMLSelectElement;
    await waitFor(() => expect(planSelect.options.length).toBe(2));
    expect(Array.from(planSelect.options).map((o) => o.value)).toEqual(['', 'p-biz']);
    fireEvent.change(planSelect, { target: { value: 'p-biz' } });
    fireEvent.change(screen.getByLabelText('admin.grants.sub.days'), { target: { value: '30' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.grants.sub.submit' }));
    fireEvent.click((await screen.findAllByRole('button', { name: 'admin.grants.sub.submit' })).at(-1)!);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(spy.mock.calls[0][0]).toMatchObject({ ownerType: 0, ownerId: ORG, planId: 'p-biz', durationDays: 30 });
    expect(spy.mock.calls[0][0]).not.toHaveProperty('activatedAt');
    expect(await screen.findByText('business')).toBeInTheDocument();
    expect(screen.getByText('admin.money.source.adminGrant')).toBeInTheDocument();
  });

  it('BE 400 "credit account" (chủ ví chưa có ví) ⇒ hiện nguyên câu server + gợi ý cấp credit trước', async () => {
    vi.spyOn(adminPaymentService, 'grantSubscription').mockRejectedValue(axios400('Owner must have a credit account before receiving a subscription grant.'));
    renderPage();
    await pickOrg(1);
    const planSelect = screen.getByLabelText('admin.grants.sub.plan') as HTMLSelectElement;
    await waitFor(() => expect(planSelect.options.length).toBe(2));
    fireEvent.change(planSelect, { target: { value: 'p-biz' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.grants.sub.submit' }));
    fireEvent.click((await screen.findAllByRole('button', { name: 'admin.grants.sub.submit' })).at(-1)!);
    expect(await screen.findByText(/Owner must have a credit account/)).toBeInTheDocument();
    expect(screen.getByText(/admin.grants.sub.error.noWalletHint/)).toBeInTheDocument();
  });
});
