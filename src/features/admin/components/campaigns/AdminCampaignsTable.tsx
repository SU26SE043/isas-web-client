import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { AdminCampaignListItem } from '../../types/adminCampaigns.types';
import {
  campaignTimelineLabel,
  formatAdminCampaignDate,
  shortenId,
} from '../../utils/adminCampaignsActions';
import { AdminCampaignStatusBadge } from './AdminCampaignStatusBadge';

interface AdminCampaignsTableProps {
  items: AdminCampaignListItem[];
}

export function AdminCampaignsTable({ items }: AdminCampaignsTableProps) {
  const { t, language } = useLanguage();

  return (
    <>
      <div className="hidden md:block">
        <Table className="min-w-[960px]">
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.campaignsManage.table.campaign')}</TableHead>
              <TableHead>{t('admin.campaignsManage.table.organization')}</TableHead>
              <TableHead>{t('admin.campaignsManage.table.status')}</TableHead>
              <TableHead className="hidden lg:table-cell">
                {t('admin.campaignsManage.table.domain')}
              </TableHead>
              <TableHead>{t('admin.campaignsManage.table.candidates')}</TableHead>
              <TableHead>{t('admin.campaignsManage.table.timeline')}</TableHead>
              <TableHead className="hidden xl:table-cell">
                {t('admin.campaignsManage.table.createdAt')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {item.title.trim() || t('admin.campaignsManage.table.untitled')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.domain?.trim() || shortenId(item.id)}
                  </p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-foreground">
                    {item.organizationName?.trim() ||
                      t('admin.campaignsManage.table.organizationFallback')}
                  </p>
                  <p className="text-xs text-muted-foreground">{shortenId(item.orgId)}</p>
                </TableCell>
                <TableCell>
                  <AdminCampaignStatusBadge status={item.status} />
                </TableCell>
                <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                  {item.domain?.trim() || '—'}
                </TableCell>
                <TableCell className="text-sm tabular-nums text-foreground">
                  <CandidatesCell item={item} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  <TimelineCell item={item} locale={language} />
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                  {formatAdminCampaignDate(item.createdAt, language)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-satin bg-surface-overlay p-4"
          >
            <p className="font-semibold text-foreground">
              {item.title.trim() || t('admin.campaignsManage.table.untitled')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {item.organizationName?.trim() ||
                t('admin.campaignsManage.table.organizationFallback')}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <AdminCampaignStatusBadge status={item.status} />
              {item.domain?.trim() ? (
                <span className="text-xs text-muted-foreground">{item.domain}</span>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              <TimelineCell item={item} locale={language} />
            </p>
            <p className="mt-1 text-sm tabular-nums text-foreground">
              <CandidatesCell item={item} />
            </p>
          </article>
        ))}
      </div>
    </>
  );
}

function CandidatesCell({ item }: { item: AdminCampaignListItem }) {
  const { t } = useLanguage();
  if (item.totalCandidates == null && item.maxCandidates == null) return '—';
  if (item.totalCandidates != null && item.maxCandidates != null) {
    return `${item.totalCandidates} / ${item.maxCandidates}`;
  }
  if (item.totalCandidates != null) {
    return t('admin.campaignsManage.table.candidatesCount').replace(
      '{{count}}',
      String(item.totalCandidates),
    );
  }
  return `— / ${item.maxCandidates}`;
}

function TimelineCell({
  item,
  locale,
}: {
  item: AdminCampaignListItem;
  locale: string;
}) {
  const { t } = useLanguage();
  const label = campaignTimelineLabel(item);
  return (
    <span className="block space-y-0.5">
      {item.startsAt || item.expiresAt ? (
        <>
          <span className="block">
            {t('admin.campaignsManage.table.startsAt')}:{' '}
            {formatAdminCampaignDate(item.startsAt, locale)}
          </span>
          <span className="block">
            {t('admin.campaignsManage.table.expiresAt')}:{' '}
            {formatAdminCampaignDate(item.expiresAt, locale)}
          </span>
        </>
      ) : (
        <span>—</span>
      )}
      {label === 'upcoming' ? (
        <span className="block text-info">{t('admin.campaignsManage.table.upcoming')}</span>
      ) : null}
      {label === 'ended' ? (
        <span className="block text-warning">{t('admin.campaignsManage.table.ended')}</span>
      ) : null}
    </span>
  );
}
