import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/patterns/ConfirmDialog';
import { EmptyState } from '@/components/patterns/EmptyState';
import { cn } from '@/lib/utils';
import { getApiErrorMessage } from '@/shared/api/apiError';
import { isTieringUiEnabled } from '@/shared/config';
import { useLanguage } from '@/shared/languages';
import { AdminPageShell } from '../components/AdminPageShell';
import { PackageFormDialog } from '../components/plans/PackageFormDialog';
import { PackageTable } from '../components/plans/PackageTable';
import { PlanFormDialog } from '../components/plans/PlanFormDialog';
import { PlanTable } from '../components/plans/PlanTable';
import { useAdminPackageList, useAdminPlanActions, useAdminPlanList } from '../hooks/useAdminPlans';
import type { Package, PlanWithEntitlements } from '../types/adminApi.types';

type Tab = 'plans' | 'packages';
type Dialog = { kind: 'plan'; plan: PlanWithEntitlements | null } | { kind: 'retire'; plan: PlanWithEntitlements } | { kind: 'package'; pkg: Package | null } | { kind: 'hide'; pkg: Package } | null;
const TAB_CLASS = 'rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200';

/**
 * Gói & Tier — hai tầng bán hàng: TIER (plan) = quyền lợi/quota, GÓI (package) = SKU đem bán (gói credit hoặc
 * thuê bao gắn một tier). Trước đợt D: 8 endpoint CRUD có, FE 0 màn — 09-13 dev "0 gói active ⇒ không mua
 * được" phải seed tay. Tab ghim `?tab=` như màn Thước đo.
 */
export function AdminPlansPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  // Tiering UI tắt ⇒ trang chỉ còn tab Gói bán (tier/plan tạm ẩn, xem isTieringUiEnabled); `?tab=plans` bị bỏ qua.
  const showTiering = isTieringUiEnabled();
  const tab: Tab = !showTiering || searchParams.get('tab') === 'packages' ? 'packages' : 'plans';
  const showTab = (next: Tab) => { const params = new URLSearchParams(searchParams); if (next === 'packages') params.set('tab', 'packages'); else params.delete('tab'); setSearchParams(params, { replace: true }); };
  const [includeInactive, setIncludeInactive] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [error, setError] = useState<string | null>(null);
  const plans = useAdminPlanList();
  const packages = useAdminPackageList(includeInactive);
  const actions = useAdminPlanActions();
  const busyId = actions.deactivatePlan.isPending ? actions.deactivatePlan.variables ?? null : actions.hidePackage.isPending ? actions.hidePackage.variables ?? null : actions.restorePackage.isPending ? actions.restorePackage.variables ?? null : null;
  const close = () => { setDialog(null); setError(null); };
  const fail = (err: unknown) => setError(getApiErrorMessage(err, t('admin.plans.error.default')));
  const saving = actions.createPlan.isPending || actions.updatePlan.isPending || actions.createPackage.isPending || actions.updatePackage.isPending;

  return (
    <AdminPageShell title={t(showTiering ? 'admin.plans.title' : 'admin.plans.titlePackagesOnly')} description={t(showTiering ? 'admin.plans.description' : 'admin.plans.descriptionPackagesOnly')} actions={(
      tab === 'plans'
        ? <Button type="button" onClick={() => setDialog({ kind: 'plan', plan: null })}>{t('admin.plans.createPlan')}</Button>
        : <Button type="button" onClick={() => setDialog({ kind: 'package', pkg: null })}>{t('admin.plans.createPackage')}</Button>
    )}>
      {showTiering ? <div role="tablist" aria-label={t('admin.plans.tab.label')} className="inline-flex gap-1 rounded-xl border border-satin bg-surface-raised p-1">
        {(['plans', 'packages'] as const).map((id) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => showTab(id)} className={cn(TAB_CLASS, tab === id ? 'bg-foreground text-background shadow-sm' : 'text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground')}>{t(`admin.plans.tab.${id}`)}</button>
        ))}
      </div> : null}
      {error && dialog === null ? <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert> : null}

      {tab === 'plans' ? (
        <>
          <Alert variant="info"><AlertDescription>{t('admin.plans.note')}</AlertDescription></Alert>
          {plans.isLoading ? <Skeleton className="h-48" /> : null}
          {plans.isError ? <Alert variant="error"><AlertDescription>{t('admin.plans.error.list')}</AlertDescription></Alert> : null}
          {plans.data ? <PlanTable plans={plans.data} busyId={busyId} onEdit={(plan) => setDialog({ kind: 'plan', plan })} onDeactivate={(plan) => setDialog({ kind: 'retire', plan })} /> : null}
        </>
      ) : (
        <>
          <label className="flex items-center gap-2 text-sm text-foreground"><input type="checkbox" className="size-4 accent-primary" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />{t('admin.plans.package.showHidden')}</label>
          {packages.isLoading ? <Skeleton className="h-48" /> : null}
          {packages.isError ? <Alert variant="error"><AlertDescription>{t('admin.plans.error.list')}</AlertDescription></Alert> : null}
          {packages.data && packages.data.length === 0 ? <EmptyState variant="no-results" title={t('admin.plans.package.empty')} description={t('admin.plans.package.emptyDescription')} /> : null}
          {packages.data && packages.data.length > 0 ? <PackageTable packages={packages.data} plans={plans.data ?? []} busyId={busyId} onEdit={(pkg) => setDialog({ kind: 'package', pkg })} onHide={(pkg) => setDialog({ kind: 'hide', pkg })} onRestore={(pkg) => actions.restorePackage.mutate(pkg.id, { onError: fail })} /> : null}
        </>
      )}

      <PlanFormDialog open={dialog?.kind === 'plan'} plan={dialog?.kind === 'plan' ? dialog.plan : null} loading={saving} errorMessage={dialog?.kind === 'plan' ? error : null} onClose={close}
        onSubmit={(input) => { setError(null); const plan = dialog?.kind === 'plan' ? dialog.plan : null; if (plan) actions.updatePlan.mutate({ id: plan.id, input }, { onSuccess: close, onError: fail }); else actions.createPlan.mutate(input, { onSuccess: close, onError: fail }); }} />
      <ConfirmDialog open={dialog?.kind === 'retire'} onOpenChange={(open) => { if (!open) close(); }} title={t('admin.plans.retireConfirm.title')} description={t('admin.plans.retireConfirm.description').replace('{name}', dialog?.kind === 'retire' ? dialog.plan.name : '')} confirmLabel={t('admin.plans.retire')} cancelLabel={t('admin.rubrics.cancel')} destructive loading={actions.deactivatePlan.isPending}
        onConfirm={() => { if (dialog?.kind === 'retire') actions.deactivatePlan.mutate(dialog.plan.id, { onSuccess: close, onError: (err) => { close(); fail(err); } }); }} />
      <PackageFormDialog open={dialog?.kind === 'package'} pkg={dialog?.kind === 'package' ? dialog.pkg : null} plans={plans.data ?? []} loading={saving} errorMessage={dialog?.kind === 'package' ? error : null} onClose={close}
        onCreate={(input) => { setError(null); actions.createPackage.mutate(input, { onSuccess: close, onError: fail }); }} onUpdate={(id, input) => { setError(null); actions.updatePackage.mutate({ id, input }, { onSuccess: close, onError: fail }); }} />
      <ConfirmDialog open={dialog?.kind === 'hide'} onOpenChange={(open) => { if (!open) close(); }} title={t('admin.plans.hideConfirm.title')} description={t('admin.plans.hideConfirm.description').replace('{name}', dialog?.kind === 'hide' ? dialog.pkg.name : '')} confirmLabel={t('admin.plans.package.hide')} cancelLabel={t('admin.rubrics.cancel')} destructive loading={actions.hidePackage.isPending}
        onConfirm={() => { if (dialog?.kind === 'hide') actions.hidePackage.mutate(dialog.pkg.id, { onSuccess: close, onError: (err) => { close(); fail(err); } }); }} />
    </AdminPageShell>
  );
}
