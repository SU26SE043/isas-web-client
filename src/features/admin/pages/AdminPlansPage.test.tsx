// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { adminPaymentService } from '../services/adminPayment.service';
import type { Package, PlanWithEntitlements } from '../types/adminApi.types';
import { AdminPlansPage } from './AdminPlansPage';

vi.mock('@/shared/languages', () => ({ useLanguage: () => ({ t: (key: string) => key, language: 'vi' }) }));
// File này khoá hành vi KHI TIERING UI BẬT (tier/thuê bao hiện). Mặc định app đang ẩn — xem AdminTieringHidden.test.tsx.
vi.mock('@/shared/config', async (importOriginal) => ({ ...(await importOriginal<typeof import('@/shared/config')>()), isTieringUiEnabled: () => true }));

// Shape `PlanResponse` (Payment, enum số): audience 0=B2C 1=B2B, interviewFunding 0=Credit 1=Metered.
const base = { rank: 0, interviewFunding: 0, monthlyQuota: null, adaptiveEnabled: true, adaptiveMaxQuestions: null, adaptiveMaxFollowups: null, groundingEnabled: false, selfConsistencyN: 1, cvAnalysisIncluded: false, repoAnalysisIncluded: false, roadmapEnabled: false, maxQuestionsCap: null, maxActiveCampaigns: null, maxCandidatesCap: null, postpaidEligible: false, seatCount: null, entitlementsVersion: 1, isActive: true, entitlementsJson: '[]' };
const free: PlanWithEntitlements = { ...base, id: 'p-free', audience: 0, code: 'free', name: 'Free' };
const plus: PlanWithEntitlements = { ...base, id: 'p-plus', audience: 0, code: 'plus', name: 'Plus', rank: 1, interviewFunding: 1, monthlyQuota: 20, entitlementsJson: '[{"k":"x"}]', entitlementsVersion: 4 };
const starter: PlanWithEntitlements = { ...base, id: 'p-starter', audience: 1, code: 'starter', name: 'Starter', maxActiveCampaigns: 2 };
const pack: Package = { id: 'pk1', name: 'Gói 10 credit', type: 1, priceVnd: 200_000, interviewCredits: 10, durationDays: null, planId: null, audience: null, isActive: true, createdAt: '2026-09-01T00:00:00Z' };
const hiddenPack: Package = { ...pack, id: 'pk2', name: 'Gói cũ', isActive: false };

const renderPage = (entry = '/admin/plans') => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><MemoryRouter initialEntries={[entry]}><AdminPlansPage /></MemoryRouter></QueryClientProvider>);
beforeEach(() => { vi.spyOn(adminPaymentService, 'listPlans').mockResolvedValue([free, plus, starter]); vi.spyOn(adminPaymentService, 'listPackages').mockImplementation(async (params = {}) => (params.includeInactive ? [pack, hiddenPack] : [pack])); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('AdminPlansPage — tab Tier', () => {
  it('nhóm B2C/B2B, badge Mặc định, gói mặc định KHÔNG có nút Ngừng bán; nút này ở gói thường mở confirm rồi DELETE', async () => {
    const delSpy = vi.spyOn(adminPaymentService, 'deletePlan').mockResolvedValue(undefined);
    renderPage();
    const b2c = await screen.findByRole('region', { name: 'admin.money.audience.b2c' });
    expect(within(b2c).getByText('Free')).toBeInTheDocument();
    expect(within(b2c).getAllByText('admin.plans.status.default')).toHaveLength(1);
    expect(within(b2c).getAllByRole('button', { name: 'admin.plans.retire' })).toHaveLength(1); // chỉ Plus
    fireEvent.click(within(b2c).getByRole('button', { name: 'admin.plans.retire' }));
    expect(await screen.findByText('admin.plans.retireConfirm.title')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'admin.plans.retire' }).at(-1)!);
    await waitFor(() => expect(delSpy).toHaveBeenCalledWith('p-plus'));
  });

  it('Sửa Plus ⇒ form đổ sẵn; đổi tên rồi Lưu ⇒ PUT với JSON/version ECHO (không reset) và quota giữ vì Metered', async () => {
    const putSpy = vi.spyOn(adminPaymentService, 'updatePlan').mockResolvedValue(plus);
    renderPage();
    const b2c = await screen.findByRole('region', { name: 'admin.money.audience.b2c' });
    fireEvent.click(within(b2c).getAllByRole('button', { name: 'admin.plans.edit' })[1]);
    const name = await screen.findByLabelText('admin.plans.field.name');
    expect(name).toHaveValue('Plus');
    fireEvent.change(name, { target: { value: 'Plus+' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.plans.form.save' }));
    await waitFor(() => expect(putSpy).toHaveBeenCalledTimes(1));
    const [id, input] = putSpy.mock.calls[0];
    expect(id).toBe('p-plus');
    expect(input).toMatchObject({ name: 'Plus+', code: 'plus', audience: 0, interviewFunding: 1, monthlyQuota: 20, entitlementsJson: '[{"k":"x"}]', entitlementsVersion: 4, maxActiveCampaigns: null, postpaidEligible: false });
  });

  it('Tạo tier B2C mới với trường B2B để nguyên ⇒ payload đã strip (BE Disallow/validate)', async () => {
    const postSpy = vi.spyOn(adminPaymentService, 'createPlan').mockResolvedValue({ ...free, id: 'new' });
    renderPage();
    await screen.findByRole('region', { name: 'admin.money.audience.b2c' });
    fireEvent.click(screen.getByRole('button', { name: 'admin.plans.createPlan' }));
    const create = await screen.findByRole('button', { name: 'admin.plans.form.create' });
    expect(create).toBeDisabled();
    fireEvent.change(screen.getByLabelText('admin.plans.field.code'), { target: { value: 'gold' } });
    fireEvent.change(screen.getByLabelText('admin.plans.field.name'), { target: { value: 'Gold' } });
    // B2C ⇒ khối B2B không hiện.
    expect(screen.queryByLabelText('admin.plans.field.seatCount')).toBeNull();
    fireEvent.click(create);
    await waitFor(() => expect(postSpy).toHaveBeenCalledTimes(1));
    expect(postSpy.mock.calls[0][0]).toMatchObject({ audience: 0, code: 'gold', name: 'Gold', seatCount: null, maxActiveCampaigns: null, maxCandidatesCap: null, postpaidEligible: false, monthlyQuota: null, entitlementsJson: '[]', entitlementsVersion: 1 });
  });
});

describe('AdminPlansPage — tab Gói bán', () => {
  it('?tab=packages: list gói đang bán; công tắc Hiện cả gói đã ẩn ⇒ listPackages({includeInactive:true}) + nút Bán lại ⇒ PUT isActive:true', async () => {
    const putSpy = vi.spyOn(adminPaymentService, 'updatePackage').mockResolvedValue({ ...hiddenPack, isActive: true });
    renderPage('/admin/plans?tab=packages');
    const table = await screen.findByRole('table', { name: 'admin.plans.tab.packages' });
    expect(within(table).getByText('Gói 10 credit')).toBeInTheDocument();
    expect(within(table).queryByText('Gói cũ')).toBeNull();
    fireEvent.click(screen.getByLabelText('admin.plans.package.showHidden'));
    await waitFor(() => expect(adminPaymentService.listPackages).toHaveBeenCalledWith({ includeInactive: true }));
    expect(await within(table).findByText('Gói cũ')).toBeInTheDocument();
    fireEvent.click(within(table).getByRole('button', { name: 'admin.plans.package.restore' }));
    await waitFor(() => expect(putSpy).toHaveBeenCalledWith('pk2', { isActive: true }));
  });

  it('Tạo gói credit ⇒ POST đúng 4 khoá (không planId/audience); Ẩn gói có confirm ⇒ DELETE', async () => {
    const postSpy = vi.spyOn(adminPaymentService, 'createPackage').mockResolvedValue({ ...pack, id: 'new' });
    const delSpy = vi.spyOn(adminPaymentService, 'deletePackage').mockResolvedValue(undefined);
    renderPage('/admin/plans?tab=packages');
    await screen.findByRole('table', { name: 'admin.plans.tab.packages' });
    fireEvent.click(screen.getByRole('button', { name: 'admin.plans.createPackage' }));
    fireEvent.change(await screen.findByLabelText('admin.plans.package.name'), { target: { value: 'Gói 5' } });
    fireEvent.change(screen.getByLabelText('admin.plans.package.priceVnd'), { target: { value: '100000' } });
    fireEvent.change(screen.getByLabelText('admin.plans.package.interviewCredits'), { target: { value: '5' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin.plans.form.create' }));
    await waitFor(() => expect(postSpy).toHaveBeenCalledWith({ name: 'Gói 5', type: 1, priceVnd: 100000, interviewCredits: 5 }));
    fireEvent.click(screen.getByRole('button', { name: 'admin.plans.package.hide' }));
    expect(await screen.findByText('admin.plans.hideConfirm.title')).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'admin.plans.package.hide' }).at(-1)!);
    await waitFor(() => expect(delSpy).toHaveBeenCalledWith('pk1'));
  });
});
