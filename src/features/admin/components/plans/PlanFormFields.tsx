import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import { INTERVIEW_FUNDING_METERED, PLAN_AUDIENCE_B2B, interviewFundingKey, planAudienceKey } from '../../utils/adminBilling';
import type { PlanFormState } from '../../utils/adminPlans';
import { SELECT_CLASS } from '../common/OrgPicker';

interface PlanFormFieldsProps { state: PlanFormState; editing: boolean; disabled: boolean; onChange: (patch: Partial<PlanFormState>) => void }

function Check({ id, label, checked, disabled, onChange }: { id: string; label: string; checked: boolean; disabled: boolean; onChange: (next: boolean) => void }) {
  return <label htmlFor={id} className="flex items-center gap-2 text-sm text-foreground"><input id={id} type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-primary" />{label}</label>;
}
function Num({ id, label, value, disabled, onChange, hint, min, max }: { id: string; label: string; value: string; disabled: boolean; onChange: (v: string) => void; hint?: string; min?: number; max?: number }) {
  return <div className="space-y-1.5"><Label htmlFor={id}>{label}</Label><Input id={id} type="number" inputMode="numeric" min={min} max={max} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />{hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}</div>;
}

/**
 * 4 khối: Chung · Phỏng vấn · AI · Quyền lợi. Khối B2B chỉ hiện khi audience=B2B; 2 trần adaptive chỉ hiện khi
 * adaptive bật; quota chỉ hiện khi Metered — khớp luật strip của `buildPlanRequest` (BE 400 nếu gửi thừa).
 * Sửa gói đang có: audience/code khoá với gói mặc định (BE từ chối đổi).
 */
export function PlanFormFields({ state, editing, disabled, onChange }: PlanFormFieldsProps) {
  const { t } = useLanguage();
  const b2b = state.audience === PLAN_AUDIENCE_B2B;
  return (
    <div className="space-y-5">
      <fieldset className="space-y-3"><legend className="text-sm font-medium text-foreground">{t('admin.plans.form.general')}</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="plan-audience">{t('admin.plans.field.audience')}</Label>
            <select id="plan-audience" className={SELECT_CLASS} value={state.audience} disabled={disabled || editing} onChange={(event) => onChange({ audience: Number(event.target.value) })}>
              <option value={0}>{t(planAudienceKey(0))}</option><option value={1}>{t(planAudienceKey(1))}</option>
            </select></div>
          <div className="space-y-1.5"><Label htmlFor="plan-code">{t('admin.plans.field.code')}</Label><Input id="plan-code" value={state.code} disabled={disabled} onChange={(event) => onChange({ code: event.target.value })} placeholder="plus" /><p className="text-xs text-muted-foreground">{t('admin.plans.field.codeHint')}</p></div>
          <div className="space-y-1.5"><Label htmlFor="plan-name">{t('admin.plans.field.name')}</Label><Input id="plan-name" value={state.name} disabled={disabled} onChange={(event) => onChange({ name: event.target.value })} /></div>
          <Num id="plan-rank" label={t('admin.plans.field.rank')} value={state.rank} disabled={disabled} min={0} onChange={(rank) => onChange({ rank })} hint={t('admin.plans.field.rankHint')} />
        </div>
        <Check id="plan-active" label={t('admin.plans.field.isActive')} checked={state.isActive} disabled={disabled} onChange={(isActive) => onChange({ isActive })} />
      </fieldset>

      <fieldset className="space-y-3"><legend className="text-sm font-medium text-foreground">{t('admin.plans.form.interview')}</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5"><Label htmlFor="plan-funding">{t('admin.plans.field.funding')}</Label>
            <select id="plan-funding" className={SELECT_CLASS} value={state.interviewFunding} disabled={disabled} onChange={(event) => onChange({ interviewFunding: Number(event.target.value) })}>
              {[0, 1, 2].map((f) => <option key={f} value={f}>{t(interviewFundingKey(f))}</option>)}
            </select></div>
          {state.interviewFunding === INTERVIEW_FUNDING_METERED ? <Num id="plan-quota" label={t('admin.plans.field.quota')} value={state.monthlyQuota} disabled={disabled} min={1} onChange={(monthlyQuota) => onChange({ monthlyQuota })} /> : null}
          <Num id="plan-maxq" label={t('admin.plans.field.maxQuestionsCap')} value={state.maxQuestionsCap} disabled={disabled} min={0} max={20} onChange={(maxQuestionsCap) => onChange({ maxQuestionsCap })} hint={t('admin.plans.field.maxQuestionsCapHint')} />
        </div>
      </fieldset>

      <fieldset className="space-y-3"><legend className="text-sm font-medium text-foreground">{t('admin.plans.form.ai')}</legend>
        <div className="flex flex-wrap gap-4">
          <Check id="plan-adaptive" label={t('admin.plans.field.adaptive')} checked={state.adaptiveEnabled} disabled={disabled} onChange={(adaptiveEnabled) => onChange({ adaptiveEnabled })} />
          <Check id="plan-grounding" label={t('admin.plans.field.grounding')} checked={state.groundingEnabled} disabled={disabled} onChange={(groundingEnabled) => onChange({ groundingEnabled })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {state.adaptiveEnabled ? <>
            <Num id="plan-amq" label={t('admin.plans.field.adaptiveMaxQuestions')} value={state.adaptiveMaxQuestions} disabled={disabled} min={0} onChange={(adaptiveMaxQuestions) => onChange({ adaptiveMaxQuestions })} hint={t('admin.plans.field.capEmptyHint')} />
            <Num id="plan-amf" label={t('admin.plans.field.adaptiveMaxFollowups')} value={state.adaptiveMaxFollowups} disabled={disabled} min={0} onChange={(adaptiveMaxFollowups) => onChange({ adaptiveMaxFollowups })} hint={t('admin.plans.field.capEmptyHint')} />
          </> : null}
          <Num id="plan-scn" label={t('admin.plans.field.selfConsistency')} value={state.selfConsistencyN} disabled={disabled} min={1} onChange={(selfConsistencyN) => onChange({ selfConsistencyN })} hint={t('admin.plans.field.selfConsistencyHint')} />
        </div>
      </fieldset>

      <fieldset className="space-y-3"><legend className="text-sm font-medium text-foreground">{t('admin.plans.form.entitlements')}</legend>
        <div className="flex flex-wrap gap-4">
          <Check id="plan-cv" label={t('admin.plans.field.cv')} checked={state.cvAnalysisIncluded} disabled={disabled} onChange={(cvAnalysisIncluded) => onChange({ cvAnalysisIncluded })} />
          <Check id="plan-repo" label={t('admin.plans.field.repo')} checked={state.repoAnalysisIncluded} disabled={disabled} onChange={(repoAnalysisIncluded) => onChange({ repoAnalysisIncluded })} />
          <Check id="plan-roadmap" label={t('admin.plans.field.roadmap')} checked={state.roadmapEnabled} disabled={disabled} onChange={(roadmapEnabled) => onChange({ roadmapEnabled })} />
        </div>
        {b2b ? (
          <div className="grid gap-3 sm:grid-cols-3">
            <Num id="plan-campaigns" label={t('admin.plans.field.maxActiveCampaigns')} value={state.maxActiveCampaigns} disabled={disabled} min={0} onChange={(maxActiveCampaigns) => onChange({ maxActiveCampaigns })} hint={t('admin.plans.field.capEmptyHint')} />
            <Num id="plan-candidates" label={t('admin.plans.field.maxCandidatesCap')} value={state.maxCandidatesCap} disabled={disabled} min={0} onChange={(maxCandidatesCap) => onChange({ maxCandidatesCap })} hint={t('admin.plans.field.capEmptyHint')} />
            <Num id="plan-seats" label={t('admin.plans.field.seatCount')} value={state.seatCount} disabled={disabled} min={0} onChange={(seatCount) => onChange({ seatCount })} hint={t('admin.plans.field.capEmptyHint')} />
            <Check id="plan-postpaid" label={t('admin.plans.field.postpaid')} checked={state.postpaidEligible} disabled={disabled} onChange={(postpaidEligible) => onChange({ postpaidEligible })} />
          </div>
        ) : <p className="text-xs text-muted-foreground">{t('admin.plans.form.b2cNote')}</p>}
      </fieldset>
    </div>
  );
}
