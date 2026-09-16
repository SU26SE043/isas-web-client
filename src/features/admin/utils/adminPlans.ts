import type { CreatePackageInput, Package, PlanInput, PlanWithEntitlements, UpdatePackageInput } from '../types/adminApi.types';
import { INTERVIEW_FUNDING_METERED, PACKAGE_TYPE_ONE_TIME, PACKAGE_TYPE_SUBSCRIPTION, PLAN_AUDIENCE_B2B, PLAN_AUDIENCE_B2C } from './adminBilling';

/** State form = chuỗi cho ô số (rỗng = không khai); build → DTO đúng shape BE. */
export interface PlanFormState {
  audience: number; code: string; name: string; rank: string; interviewFunding: number; monthlyQuota: string;
  adaptiveEnabled: boolean; adaptiveMaxQuestions: string; adaptiveMaxFollowups: string; groundingEnabled: boolean; selfConsistencyN: string;
  cvAnalysisIncluded: boolean; repoAnalysisIncluded: boolean; roadmapEnabled: boolean; maxQuestionsCap: string;
  maxActiveCampaigns: string; maxCandidatesCap: string; postpaidEligible: boolean; seatCount: string;
  isActive: boolean; entitlementsJson: string; entitlementsVersion: number;
}

export const EMPTY_PLAN_FORM: PlanFormState = {
  audience: PLAN_AUDIENCE_B2C, code: '', name: '', rank: '0', interviewFunding: 0, monthlyQuota: '',
  adaptiveEnabled: true, adaptiveMaxQuestions: '', adaptiveMaxFollowups: '', groundingEnabled: false, selfConsistencyN: '1',
  cvAnalysisIncluded: false, repoAnalysisIncluded: false, roadmapEnabled: false, maxQuestionsCap: '',
  maxActiveCampaigns: '', maxCandidatesCap: '', postpaidEligible: false, seatCount: '',
  isActive: true, entitlementsJson: '[]', entitlementsVersion: 1,
};

const str = (value: number | null | undefined) => (value === null || value === undefined ? '' : String(value));
const num = (value: string): number | null => (value.trim() === '' ? null : Number(value));

export function planFormFromPlan(plan: PlanWithEntitlements): PlanFormState {
  return {
    audience: plan.audience, code: plan.code, name: plan.name, rank: String(plan.rank), interviewFunding: plan.interviewFunding, monthlyQuota: str(plan.monthlyQuota),
    adaptiveEnabled: plan.adaptiveEnabled, adaptiveMaxQuestions: str(plan.adaptiveMaxQuestions), adaptiveMaxFollowups: str(plan.adaptiveMaxFollowups), groundingEnabled: plan.groundingEnabled, selfConsistencyN: String(plan.selfConsistencyN),
    cvAnalysisIncluded: plan.cvAnalysisIncluded, repoAnalysisIncluded: plan.repoAnalysisIncluded, roadmapEnabled: plan.roadmapEnabled, maxQuestionsCap: str(plan.maxQuestionsCap),
    maxActiveCampaigns: str(plan.maxActiveCampaigns), maxCandidatesCap: str(plan.maxCandidatesCap), postpaidEligible: plan.postpaidEligible, seatCount: str(plan.seatCount),
    // BE-D3 trả entitlementsJson; bản BE cũ không có ⇒ "[]" (đúng seed) — vẫn tốt hơn gửi thiếu (PlanRequest Disallow).
    isActive: plan.isActive, entitlementsJson: plan.entitlementsJson ?? '[]', entitlementsVersion: plan.entitlementsVersion,
  };
}

/**
 * Chép luật `PlanService.Validate` + `PlanRequest` (Disallow khoá lạ) sang FE để KHÔNG gửi nguyên state:
 * B2C phải null 3 trần B2B + postpaidEligible=false · adaptive tắt ⇒ 2 cap null · không Metered ⇒ quota null.
 * Gửi thừa là 400 ở BE với câu tiếng Anh admin không đoán được vì sao.
 */
export function buildPlanRequest(state: PlanFormState): PlanInput {
  const b2b = state.audience === PLAN_AUDIENCE_B2B;
  const metered = state.interviewFunding === INTERVIEW_FUNDING_METERED;
  return {
    audience: state.audience, code: state.code.trim(), name: state.name.trim(), rank: Number(state.rank || 0),
    interviewFunding: state.interviewFunding, monthlyQuota: metered ? num(state.monthlyQuota) : null,
    adaptiveEnabled: state.adaptiveEnabled,
    adaptiveMaxQuestions: state.adaptiveEnabled ? num(state.adaptiveMaxQuestions) : null,
    adaptiveMaxFollowups: state.adaptiveEnabled ? num(state.adaptiveMaxFollowups) : null,
    groundingEnabled: state.groundingEnabled, selfConsistencyN: Number(state.selfConsistencyN || 1),
    cvAnalysisIncluded: state.cvAnalysisIncluded, repoAnalysisIncluded: state.repoAnalysisIncluded, roadmapEnabled: state.roadmapEnabled,
    maxQuestionsCap: num(state.maxQuestionsCap),
    maxActiveCampaigns: b2b ? num(state.maxActiveCampaigns) : null,
    maxCandidatesCap: b2b ? num(state.maxCandidatesCap) : null,
    postpaidEligible: b2b ? state.postpaidEligible : false,
    seatCount: b2b ? num(state.seatCount) : null,
    isActive: state.isActive, entitlementsJson: state.entitlementsJson || '[]', entitlementsVersion: state.entitlementsVersion,
  };
}

/** Lỗi form theo đúng luật BE — trả khoá i18n để nói trước, không đợi 400. */
export function planFormErrors(state: PlanFormState): string[] {
  const errors: string[] = [];
  if (!state.code.trim()) errors.push('admin.plans.form.error.code');
  if (!state.name.trim()) errors.push('admin.plans.form.error.name');
  if (Number(state.rank || 0) < 0) errors.push('admin.plans.form.error.rank');
  if (Number(state.selfConsistencyN || 1) < 1) errors.push('admin.plans.form.error.selfConsistency');
  const cap = num(state.maxQuestionsCap);
  if (cap !== null && (cap < 0 || cap > 20)) errors.push('admin.plans.form.error.maxQuestionsCap');
  if (state.interviewFunding === INTERVIEW_FUNDING_METERED && !((num(state.monthlyQuota) ?? 0) > 0)) errors.push('admin.plans.form.error.quota');
  return errors;
}

/** `free` (B2C) và `starter` (B2B) là gói mặc định — BE từ chối ngừng bán (`PlanService.IsDefaultPlan`). */
export function isDefaultPlan(plan: Pick<PlanWithEntitlements, 'audience' | 'code'>): boolean {
  return (plan.audience === PLAN_AUDIENCE_B2C && plan.code === 'free') || (plan.audience === PLAN_AUDIENCE_B2B && plan.code === 'starter');
}

export interface PackageFormState { name: string; type: number; priceVnd: string; interviewCredits: string; durationDays: string; planId: string; audience: number }
export const EMPTY_PACKAGE_FORM: PackageFormState = { name: '', type: PACKAGE_TYPE_ONE_TIME, priceVnd: '', interviewCredits: '', durationDays: '30', planId: '', audience: PLAN_AUDIENCE_B2C };

export function packageFormFromPackage(pkg: Package): PackageFormState {
  return { name: pkg.name, type: pkg.type, priceVnd: String(pkg.priceVnd), interviewCredits: str(pkg.interviewCredits), durationDays: str(pkg.durationDays), planId: pkg.planId ?? '', audience: pkg.audience ?? PLAN_AUDIENCE_B2C };
}

/** OneTime KHÔNG được mang planId/audience (BE 400); Subscription bắt buộc durationDays + planId + audience. */
export function buildCreatePackageRequest(state: PackageFormState): CreatePackageInput {
  const base = { name: state.name.trim(), type: state.type, priceVnd: Number(state.priceVnd) };
  return state.type === PACKAGE_TYPE_SUBSCRIPTION
    ? { ...base, durationDays: Number(state.durationDays), planId: state.planId, audience: state.audience }
    : { ...base, interviewCredits: Number(state.interviewCredits) };
}

/** Update không có `type` (UpdatePackageRequest không khai — gửi là 400). Chỉ gửi field của loại đang có. */
export function buildUpdatePackageRequest(state: PackageFormState): UpdatePackageInput {
  const base = { name: state.name.trim(), priceVnd: Number(state.priceVnd) };
  return state.type === PACKAGE_TYPE_SUBSCRIPTION
    ? { ...base, durationDays: Number(state.durationDays), planId: state.planId, audience: state.audience }
    : { ...base, interviewCredits: Number(state.interviewCredits) };
}

export function packageFormErrors(state: PackageFormState): string[] {
  const errors: string[] = [];
  if (!state.name.trim()) errors.push('admin.plans.package.error.name');
  if (!(Number(state.priceVnd) >= 0) || state.priceVnd.trim() === '') errors.push('admin.plans.package.error.price');
  if (state.type === PACKAGE_TYPE_SUBSCRIPTION) {
    if (!(Number(state.durationDays) > 0)) errors.push('admin.plans.package.error.duration');
    if (!state.planId) errors.push('admin.plans.package.error.plan');
  } else if (!(Number(state.interviewCredits) > 0)) errors.push('admin.plans.package.error.credits');
  return errors;
}
