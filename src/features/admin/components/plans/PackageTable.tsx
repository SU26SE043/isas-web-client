import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { isTieringUiEnabled } from '@/shared/config';
import { useLanguage } from '@/shared/languages';
import type { Package, PlanWithEntitlements } from '../../types/adminApi.types';
import { PACKAGE_TYPE_SUBSCRIPTION, formatVnd, packageTypeKey, planAudienceKey } from '../../utils/adminBilling';

interface PackageTableProps { packages: Package[]; plans: PlanWithEntitlements[]; busyId: string | null; onEdit: (pkg: Package) => void; onHide: (pkg: Package) => void; onRestore: (pkg: Package) => void }

/** Gói bán (SKU): gói credit mua lẻ hoặc thuê bao gắn một tier. Ẩn = soft-delete; Bán lại = isActive true (cần BE-D1 để thấy). */
export function PackageTable({ packages, plans, busyId, onEdit, onHide, onRestore }: PackageTableProps) {
  const { t, language } = useLanguage();
  const locale = language === 'vi' ? 'vi-VN' : 'en-US';
  const showTier = isTieringUiEnabled();   // tắt ⇒ bỏ 2 cột Tier/Đối tượng (luôn trống khi không bán thuê bao)
  const planName = (id: string | null | undefined) => (id ? plans.find((p) => p.id === id)?.name ?? id.slice(0, 8) : '—');
  return (
    <div className="overflow-x-auto">
      <Table className={showTier ? "min-w-[880px]" : "min-w-[640px]"} aria-label={t('admin.plans.tab.packages')}>
        <TableHeader><TableRow>
          <TableHead>{t('admin.plans.package.name')}</TableHead><TableHead>{t('admin.plans.package.type')}</TableHead><TableHead className="text-right">{t('admin.plans.package.price')}</TableHead>
          <TableHead>{t('admin.plans.package.content')}</TableHead>{showTier ? <><TableHead>{t('admin.plans.package.plan')}</TableHead><TableHead>{t('admin.plans.package.audience')}</TableHead></> : null}<TableHead>{t('admin.plans.table.status')}</TableHead><TableHead className="text-right">{t('admin.plans.table.actions')}</TableHead>
        </TableRow></TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow key={pkg.id}>
              <TableCell className="font-medium text-foreground">{pkg.name}</TableCell>
              <TableCell>{t(packageTypeKey(pkg.type))}</TableCell>
              <TableCell className="text-right tabular-nums">{formatVnd(pkg.priceVnd, locale)}</TableCell>
              <TableCell className="tabular-nums">{pkg.type === PACKAGE_TYPE_SUBSCRIPTION ? t('admin.plans.package.days').replace('{n}', String(pkg.durationDays ?? '—')) : t('admin.plans.package.credits').replace('{n}', String(pkg.interviewCredits ?? '—'))}</TableCell>
              {showTier ? <>
                <TableCell>{planName(pkg.planId)}</TableCell>
                <TableCell>{pkg.audience === null || pkg.audience === undefined ? '—' : t(planAudienceKey(pkg.audience))}</TableCell>
              </> : null}
              <TableCell><Badge variant={pkg.isActive ? 'success' : 'outline'}>{pkg.isActive ? t('admin.plans.package.selling') : t('admin.plans.package.hidden')}</Badge></TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <Button type="button" variant="ghost" size="sm" disabled={busyId !== null} onClick={() => onEdit(pkg)}>{t('admin.plans.edit')}</Button>
                {pkg.isActive
                  ? <Button type="button" variant="ghost" size="sm" className="text-error" disabled={busyId !== null} loading={busyId === pkg.id} onClick={() => onHide(pkg)}>{t('admin.plans.package.hide')}</Button>
                  : <Button type="button" variant="ghost" size="sm" disabled={busyId !== null} loading={busyId === pkg.id} onClick={() => onRestore(pkg)}>{t('admin.plans.package.restore')}</Button>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
