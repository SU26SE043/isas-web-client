import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/shared/languages';
import type { PlanInput, PlanWithEntitlements } from '../../types/adminApi.types';
import { EMPTY_PLAN_FORM, buildPlanRequest, planFormErrors, planFormFromPlan, type PlanFormState } from '../../utils/adminPlans';
import { PlanFormFields } from './PlanFormFields';

interface PlanFormDialogProps { open: boolean; plan: PlanWithEntitlements | null; loading: boolean; errorMessage: string | null; onClose: () => void; onSubmit: (input: PlanInput) => void }

/** Tạo/sửa gói tier. Sửa ⇒ echo `entitlementsJson`/`entitlementsVersion` (BE ghi đè cả hai) — không có ô sửa JSON, ghi rõ. */
export function PlanFormDialog({ open, plan, loading, errorMessage, onClose, onSubmit }: PlanFormDialogProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<PlanFormState>(EMPTY_PLAN_FORM);
  useEffect(() => { if (open) setState(plan ? planFormFromPlan(plan) : EMPTY_PLAN_FORM); }, [open, plan]);
  const errors = planFormErrors(state);
  const missingJson = plan !== null && plan.entitlementsJson === undefined;

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !loading) onClose(); }}>
      <DialogContent showCloseButton={!loading} className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{plan ? t('admin.plans.form.editTitle').replace('{name}', plan.name) : t('admin.plans.form.createTitle')}</DialogTitle><DialogDescription>{t('admin.plans.form.description')}</DialogDescription></DialogHeader>
        <PlanFormFields state={state} editing={plan !== null} disabled={loading} onChange={(patch) => setState((prev) => ({ ...prev, ...patch }))} />
        {missingJson ? <Alert variant="warning"><AlertDescription>{t('admin.plans.form.jsonMissingWarning')}</AlertDescription></Alert> : <p className="text-xs text-muted-foreground">{t('admin.plans.form.jsonNote').replace('{version}', String(state.entitlementsVersion))}</p>}
        {errors.length ? <ul className="list-disc space-y-0.5 pl-5 text-xs text-warning">{errors.map((key) => <li key={key}>{t(key)}</li>)}</ul> : null}
        {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
        <DialogFooter className="sticky -bottom-6 bg-background/95 pt-3">
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>{t('admin.rubrics.cancel')}</Button>
          <Button type="button" loading={loading} disabled={errors.length > 0} onClick={() => onSubmit(buildPlanRequest(state))}>{plan ? t('admin.plans.form.save') : t('admin.plans.form.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
