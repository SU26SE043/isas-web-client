import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/shared/languages';
import type { CreatePackageInput, Package, PlanWithEntitlements, UpdatePackageInput } from '../../types/adminApi.types';
import { PACKAGE_TYPE_ONE_TIME, PACKAGE_TYPE_SUBSCRIPTION, packageTypeKey, planAudienceKey } from '../../utils/adminBilling';
import { EMPTY_PACKAGE_FORM, buildCreatePackageRequest, buildUpdatePackageRequest, packageFormErrors, packageFormFromPackage, type PackageFormState } from '../../utils/adminPlans';
import { SELECT_CLASS } from '../common/OrgPicker';

interface PackageFormDialogProps {
  open: boolean; pkg: Package | null; plans: PlanWithEntitlements[]; loading: boolean; errorMessage: string | null;
  onClose: () => void; onCreate: (input: CreatePackageInput) => void; onUpdate: (id: string, input: UpdatePackageInput) => void;
}

/**
 * Loại chọn TRƯỚC, field theo loại: Gói credit (giá + số credit; KHÔNG gửi planId/audience) · Thuê bao (giá + số
 * ngày + tier cùng audience). Sửa không đổi được loại (BE `UpdatePackageRequest` không có `type`).
 */
export function PackageFormDialog({ open, pkg, plans, loading, errorMessage, onClose, onCreate, onUpdate }: PackageFormDialogProps) {
  const { t } = useLanguage();
  const [state, setState] = useState<PackageFormState>(EMPTY_PACKAGE_FORM);
  useEffect(() => { if (open) setState(pkg ? packageFormFromPackage(pkg) : EMPTY_PACKAGE_FORM); }, [open, pkg]);
  const set = (patch: Partial<PackageFormState>) => setState((prev) => ({ ...prev, ...patch }));
  const errors = packageFormErrors(state);
  const subscription = state.type === PACKAGE_TYPE_SUBSCRIPTION;
  const planOptions = plans.filter((p) => p.isActive && p.audience === state.audience);
  const submit = () => (pkg ? onUpdate(pkg.id, buildUpdatePackageRequest(state)) : onCreate(buildCreatePackageRequest(state)));

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !loading) onClose(); }}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader><DialogTitle>{pkg ? t('admin.plans.package.editTitle').replace('{name}', pkg.name) : t('admin.plans.package.createTitle')}</DialogTitle><DialogDescription>{t('admin.plans.package.description')}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="pkg-type">{t('admin.plans.package.type')}</Label>
              <select id="pkg-type" className={SELECT_CLASS} value={state.type} disabled={loading || pkg !== null} onChange={(event) => set({ type: Number(event.target.value) })}>
                <option value={PACKAGE_TYPE_ONE_TIME}>{t(packageTypeKey(PACKAGE_TYPE_ONE_TIME))}</option><option value={PACKAGE_TYPE_SUBSCRIPTION}>{t(packageTypeKey(PACKAGE_TYPE_SUBSCRIPTION))}</option>
              </select></div>
            <div className="space-y-1.5"><Label htmlFor="pkg-name">{t('admin.plans.package.name')}</Label><Input id="pkg-name" value={state.name} disabled={loading} onChange={(event) => set({ name: event.target.value })} /></div>
            <div className="space-y-1.5"><Label htmlFor="pkg-price">{t('admin.plans.package.priceVnd')}</Label><Input id="pkg-price" type="number" inputMode="numeric" min={0} value={state.priceVnd} disabled={loading} onChange={(event) => set({ priceVnd: event.target.value })} /></div>
            {subscription ? (
              <>
                <div className="space-y-1.5"><Label htmlFor="pkg-days">{t('admin.plans.package.durationDays')}</Label><Input id="pkg-days" type="number" inputMode="numeric" min={1} value={state.durationDays} disabled={loading} onChange={(event) => set({ durationDays: event.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="pkg-audience">{t('admin.plans.package.audience')}</Label>
                  <select id="pkg-audience" className={SELECT_CLASS} value={state.audience} disabled={loading} onChange={(event) => set({ audience: Number(event.target.value), planId: '' })}>
                    <option value={0}>{t(planAudienceKey(0))}</option><option value={1}>{t(planAudienceKey(1))}</option>
                  </select></div>
                <div className="space-y-1.5"><Label htmlFor="pkg-plan">{t('admin.plans.package.plan')}</Label>
                  <select id="pkg-plan" className={SELECT_CLASS} value={state.planId} disabled={loading} onChange={(event) => set({ planId: event.target.value })}>
                    <option value="">{t('admin.grants.sub.planPlaceholder')}</option>{planOptions.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                  </select></div>
              </>
            ) : (
              <div className="space-y-1.5"><Label htmlFor="pkg-credits">{t('admin.plans.package.interviewCredits')}</Label><Input id="pkg-credits" type="number" inputMode="numeric" min={1} value={state.interviewCredits} disabled={loading} onChange={(event) => set({ interviewCredits: event.target.value })} /></div>
            )}
          </div>
          {errors.length ? <ul className="list-disc space-y-0.5 pl-5 text-xs text-warning">{errors.map((key) => <li key={key}>{t(key)}</li>)}</ul> : null}
          {errorMessage ? <Alert variant="error"><AlertDescription>{errorMessage}</AlertDescription></Alert> : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>{t('admin.rubrics.cancel')}</Button>
          <Button type="button" loading={loading} disabled={errors.length > 0} onClick={submit}>{pkg ? t('admin.plans.form.save') : t('admin.plans.form.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
