import { describe, expect, it } from 'vitest';
import { EMPTY_PACKAGE_FORM, EMPTY_PLAN_FORM, buildCreatePackageRequest, buildPlanRequest, buildUpdatePackageRequest, isDefaultPlan, packageFormErrors, planFormErrors, planFormFromPlan } from './adminPlans';

// Luật chép từ PlanService.Validate + PlanRequest/PackageRequest [Disallow]: gửi thừa/sai là 400 với câu
// tiếng Anh admin không đoán được — nên khoá ở FE bằng test, không đợi BE mắng.
describe('buildPlanRequest — strip theo audience/cờ', () => {
  it('B2C: 3 trần B2B = null, postpaidEligible = false dù state có giá trị', () => {
    const req = buildPlanRequest({ ...EMPTY_PLAN_FORM, audience: 0, code: 'plus', name: 'Plus', maxActiveCampaigns: '5', maxCandidatesCap: '10', seatCount: '3', postpaidEligible: true });
    expect(req.maxActiveCampaigns).toBeNull(); expect(req.maxCandidatesCap).toBeNull(); expect(req.seatCount).toBeNull(); expect(req.postpaidEligible).toBe(false);
  });
  it('B2B giữ trần; adaptive tắt ⇒ 2 cap null; không Metered ⇒ quota null; Metered ⇒ quota số', () => {
    const b2b = buildPlanRequest({ ...EMPTY_PLAN_FORM, audience: 1, code: 'biz', name: 'Biz', maxActiveCampaigns: '5', seatCount: '3', postpaidEligible: true, adaptiveEnabled: false, adaptiveMaxQuestions: '9', monthlyQuota: '40' });
    expect(b2b.maxActiveCampaigns).toBe(5); expect(b2b.seatCount).toBe(3); expect(b2b.postpaidEligible).toBe(true);
    expect(b2b.adaptiveMaxQuestions).toBeNull(); expect(b2b.monthlyQuota).toBeNull();
    const metered = buildPlanRequest({ ...EMPTY_PLAN_FORM, code: 'pro', name: 'Pro', interviewFunding: 1, monthlyQuota: '40', adaptiveEnabled: true, adaptiveMaxQuestions: '9' });
    expect(metered.monthlyQuota).toBe(40); expect(metered.adaptiveMaxQuestions).toBe(9);
  });
  it('echo entitlementsJson/entitlementsVersion từ plan đang sửa; BE cũ không trả JSON ⇒ "[]"', () => {
    const plan = { id: 'p', audience: 1, code: 'biz', name: 'Biz', rank: 2, interviewFunding: 0, adaptiveEnabled: true, groundingEnabled: false, selfConsistencyN: 1, cvAnalysisIncluded: false, repoAnalysisIncluded: false, roadmapEnabled: false, postpaidEligible: false, entitlementsVersion: 3, isActive: true, entitlementsJson: '[{"k":1}]' };
    const req = buildPlanRequest(planFormFromPlan(plan));
    expect(req.entitlementsJson).toBe('[{"k":1}]'); expect(req.entitlementsVersion).toBe(3);
    expect(planFormFromPlan({ ...plan, entitlementsJson: undefined }).entitlementsJson).toBe('[]');
  });
  it('planFormErrors theo luật BE: Metered cần quota>0; cap 0..20; N ≥ 1', () => {
    expect(planFormErrors({ ...EMPTY_PLAN_FORM, code: 'x', name: 'X', interviewFunding: 1, monthlyQuota: '' })).toContain('admin.plans.form.error.quota');
    expect(planFormErrors({ ...EMPTY_PLAN_FORM, code: 'x', name: 'X', maxQuestionsCap: '21' })).toContain('admin.plans.form.error.maxQuestionsCap');
    expect(planFormErrors({ ...EMPTY_PLAN_FORM, code: 'x', name: 'X', selfConsistencyN: '0' })).toContain('admin.plans.form.error.selfConsistency');
    expect(planFormErrors({ ...EMPTY_PLAN_FORM, code: 'x', name: 'X' })).toEqual([]);
  });
  it('isDefaultPlan: free/B2C và starter/B2B; free/B2B thì không', () => {
    expect(isDefaultPlan({ audience: 0, code: 'free' })).toBe(true);
    expect(isDefaultPlan({ audience: 1, code: 'starter' })).toBe(true);
    expect(isDefaultPlan({ audience: 1, code: 'free' })).toBe(false);
  });
});

describe('build*PackageRequest — OneTime không mang planId/audience, Update không mang type', () => {
  it('OneTime create: đúng 4 khoá', () => {
    const req = buildCreatePackageRequest({ ...EMPTY_PACKAGE_FORM, name: 'Gói 10', priceVnd: '200000', interviewCredits: '10', planId: 'leftover', audience: 1 });
    expect(req).toEqual({ name: 'Gói 10', type: 1, priceVnd: 200000, interviewCredits: 10 });
  });
  it('Subscription create: durationDays + planId + audience, không interviewCredits', () => {
    const req = buildCreatePackageRequest({ ...EMPTY_PACKAGE_FORM, type: 2, name: 'Pro tháng', priceVnd: '99000', durationDays: '30', planId: 'p-pro', audience: 0, interviewCredits: '5' });
    expect(req).toEqual({ name: 'Pro tháng', type: 2, priceVnd: 99000, durationDays: 30, planId: 'p-pro', audience: 0 });
  });
  it('Update: không có `type` (UpdatePackageRequest không khai ⇒ 400)', () => {
    const req = buildUpdatePackageRequest({ ...EMPTY_PACKAGE_FORM, name: 'Gói 10', priceVnd: '250000', interviewCredits: '10' });
    expect(req).toEqual({ name: 'Gói 10', priceVnd: 250000, interviewCredits: 10 });
    expect(req).not.toHaveProperty('type');
  });
  it('packageFormErrors: thuê bao đòi tier + ngày; gói credit đòi credit', () => {
    expect(packageFormErrors({ ...EMPTY_PACKAGE_FORM, type: 2, name: 'x', priceVnd: '1', durationDays: '0', planId: '' })).toEqual(['admin.plans.package.error.duration', 'admin.plans.package.error.plan']);
    expect(packageFormErrors({ ...EMPTY_PACKAGE_FORM, name: 'x', priceVnd: '1', interviewCredits: '' })).toEqual(['admin.plans.package.error.credits']);
  });
});
