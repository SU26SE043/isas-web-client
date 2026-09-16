import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { PlanWithEntitlements } from '../../types/adminApi.types';
import { interviewFundingKey, planAudienceKey } from '../../utils/adminBilling';
import { isDefaultPlan } from '../../utils/adminPlans';

interface PlanTableProps { plans: PlanWithEntitlements[]; busyId: string | null; onEdit: (plan: PlanWithEntitlements) => void; onDeactivate: (plan: PlanWithEntitlements) => void }

const yes = '✓';
const cap = (value: number | null | undefined) => (value === null || value === undefined ? '—' : String(value));

/** Một bảng cho mỗi đối tượng (B2C / B2B), sort theo rank — đúng thứ tự BE trả. Gói mặc định không có nút Ngừng bán. */
export function PlanTable({ plans, busyId, onEdit, onDeactivate }: PlanTableProps) {
  const { t } = useLanguage();
  const groups = [0, 1].map((audience) => ({ audience, rows: plans.filter((p) => p.audience === audience) })).filter((g) => g.rows.length > 0);
  return (
    <div className="space-y-6">
      {groups.map(({ audience, rows }) => (
        <section key={audience} className="space-y-2" aria-label={t(planAudienceKey(audience))}>
          <h3 className="text-sm font-medium text-foreground">{t(planAudienceKey(audience))}</h3>
          <div className="overflow-x-auto">
            <Table className="min-w-[1080px]">
              <TableHeader><TableRow>
                <TableHead>{t('admin.plans.table.plan')}</TableHead><TableHead>{t('admin.plans.table.funding')}</TableHead><TableHead>{t('admin.plans.table.ai')}</TableHead>
                <TableHead>{t('admin.plans.table.includes')}</TableHead><TableHead>{t('admin.plans.table.caps')}</TableHead><TableHead>{t('admin.plans.table.status')}</TableHead><TableHead className="text-right">{t('admin.plans.table.actions')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {rows.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell><p className="font-medium text-foreground">{plan.name}</p><p className="font-mono text-xs text-muted-foreground">{plan.code} · #{plan.rank}</p></TableCell>
                    <TableCell>{t(interviewFundingKey(plan.interviewFunding))}{plan.monthlyQuota ? ` · ${plan.monthlyQuota}/${t('admin.plans.table.month')}` : ''}</TableCell>
                    <TableCell className="text-xs">{plan.adaptiveEnabled ? `${t('admin.plans.field.adaptive')} ${yes}` : ''}{plan.groundingEnabled ? ` · ${t('admin.plans.field.grounding')} ${yes}` : ''} · N={plan.selfConsistencyN}</TableCell>
                    <TableCell className="text-xs">{[plan.cvAnalysisIncluded && t('admin.plans.field.cv'), plan.repoAnalysisIncluded && t('admin.plans.field.repo'), plan.roadmapEnabled && t('admin.plans.field.roadmap')].filter(Boolean).join(' · ') || '—'}</TableCell>
                    <TableCell className="text-xs tabular-nums">
                      {t('admin.plans.table.capQuestions')} {cap(plan.maxQuestionsCap)}
                      {plan.audience === 1 ? ` · ${t('admin.plans.table.capCampaigns')} ${cap(plan.maxActiveCampaigns)} · ${t('admin.plans.table.capCandidates')} ${cap(plan.maxCandidatesCap)} · ${t('admin.plans.table.seats')} ${cap(plan.seatCount)}${plan.postpaidEligible ? ` · ${t('admin.plans.field.postpaid')}` : ''}` : ''}
                    </TableCell>
                    <TableCell><Badge variant={plan.isActive ? 'success' : 'outline'}>{plan.isActive ? t('admin.plans.status.active') : t('admin.plans.status.retired')}</Badge>{isDefaultPlan(plan) ? <Badge variant="info" className="ml-1">{t('admin.plans.status.default')}</Badge> : null}</TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      <Button type="button" variant="ghost" size="sm" disabled={busyId !== null} onClick={() => onEdit(plan)}>{t('admin.plans.edit')}</Button>
                      {plan.isActive && !isDefaultPlan(plan) ? <Button type="button" variant="ghost" size="sm" className="text-error" disabled={busyId !== null} loading={busyId === plan.id} onClick={() => onDeactivate(plan)}>{t('admin.plans.retire')}</Button> : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ))}
    </div>
  );
}
