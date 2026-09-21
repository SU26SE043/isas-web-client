import { Button } from '@/components/ui/button';
import { AppPagination, DEFAULT_PAGE_SIZE } from '@/components/ui/app-pagination';
import { Fragment, useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/patterns/EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import { Badge } from '@/components/ui/badge';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { canSelectCandidate, getCandidateRanks, isCandidateScreeningPending } from './screeningUtils';
import { CandidateAnalyzingRow } from './CandidateAnalyzingRow';
import { CandidateEmailCell } from './CandidateEmailCell';
import { CandidateStatusCell } from './CandidateStatusCell';
import { CandidateVerifyFlag } from './CandidateVerifyFlag';

/** Số cột của bảng — ô header nhóm phải trải đúng bấy nhiêu. */
const COLUMN_COUNT = 5;
const SKILLS_SHOWN = 3;

interface CandidateRankingTableProps {
  candidates: CampaignCandidateListItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onViewDetail: (id: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onChooseFiles: () => void;
  onUpdateEmail?: (candidateId: string, email: string) => Promise<void>;
  updatingCandidateId?: string | null;
  allowIneligibleSelection?: boolean;
  onRescreen?: (candidateId: string) => void;
  rescreeningCandidateId?: string | null;
  allowMissingEmailSelection?: boolean;
}

/**
 * Bảng xếp hạng CV: 5 cột (chọn · ứng viên · điểm · kỹ năng · thao tác). Rà UI 21/09: bản 7 cột
 * (thêm Xếp hạng + Trạng thái) rộng hơn khung wizard ⇒ "Xem chi tiết" rơi ra ngoài tầm mắt, còn
 * "Chọn tất cả" xuất hiện HAI lần (nút rời + chữ ở header cột tick). Nay hạng gộp vào ô ứng viên,
 * trạng thái chỉ hiện khi khác "Đã phân tích", và checkbox header là nút chọn-tất-cả duy nhất.
 */
export function CandidateRankingTable({
  candidates,
  selectedIds,
  onToggle,
  onToggleAll,
  onViewDetail,
  hasActiveFilters,
  onClearFilters,
  onChooseFiles,
  onUpdateEmail,
  updatingCandidateId = null,
  allowIneligibleSelection = false,
  onRescreen,
  rescreeningCandidateId = null,
  allowMissingEmailSelection = false,
}: CandidateRankingTableProps) {
  const { t } = useLanguage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selectableIds = candidates
    .filter((item) => canSelectRow(item, allowIneligibleSelection, allowMissingEmailSelection))
    .map((item) => item.id);
  const selectedCount = selectableIds.filter((id) => selectedIds.has(id)).length;
  const allSelected = selectableIds.length > 0 && selectedCount === selectableIds.length;
  const candidateRanks = getCandidateRanks(candidates);
  const groupedCandidates = groupCandidates(candidates, t);

  useEffect(() => {
    setPage(1);
  }, [candidates]);

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = selectedCount > 0 && !allSelected;
  }, [selectedCount, allSelected]);

  if (candidates.length === 0) {
    return (
      <EmptyState
        variant={hasActiveFilters ? 'no-results' : 'no-data'}
        title={t('employer.campaigns.screening.ranking.title')}
        description={
          hasActiveFilters
            ? t('employer.campaigns.screening.ranking.emptyFilter')
            : t('employer.campaigns.screening.ranking.empty')
        }
        action={
          hasActiveFilters ? (
            <Button type="button" variant="outline" onClick={onClearFilters}>
              {t('employer.campaigns.screening.ranking.clearFilters')}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={onChooseFiles}>
              {t('employer.campaigns.screening.upload.selectFiles')}
            </Button>
          )
        }
      />
    );
  }

  const rows = groupedCandidates.flatMap((group) => group.items).slice((page - 1) * pageSize, page * pageSize);
  const groupStarts = new Map<string, string>();
  groupedCandidates.forEach((group) => {
    if (groupedCandidates.length > 1 && group.items[0]) groupStarts.set(group.items[0].id, group.title);
  });

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t('employer.campaigns.screening.ranking.selectHint')}</p>

      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                disabled={selectableIds.length === 0}
                onChange={() => onToggleAll(allSelected ? [] : selectableIds)}
                className="size-4 rounded border-satin"
                aria-label={allSelected
                  ? t('employer.campaigns.screening.ranking.clearSelection')
                  : t('employer.campaigns.screening.ranking.selectAll')}
              />
            </TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.candidate')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.matchScore')}</TableHead>
            <TableHead>{t('employer.campaigns.screening.ranking.skills')}</TableHead>
            <TableHead className="w-32">{t('employer.campaigns.screening.ranking.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((item) => {
            const selectable = canSelectRow(item, allowIneligibleSelection, allowMissingEmailSelection);
            const groupTitle = groupStarts.get(item.id);
            const groupHeader = groupTitle ? (
              <TableRow><TableCell colSpan={COLUMN_COUNT} className="bg-surface-elevated font-semibold text-foreground">{groupTitle}</TableCell></TableRow>
            ) : null;
            if (isCandidateScreeningPending(item)) {
              return <Fragment key={item.id}>{groupHeader}<CandidateAnalyzingRow candidate={item} /></Fragment>;
            }
            const rank = candidateRanks.get(item.id);
            const skills = item.skills ?? [];
            return (
              <Fragment key={item.id}>
                {groupHeader}
              <TableRow>
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    disabled={!selectable}
                    onChange={() => onToggle(item.id)}
                    className="size-4 rounded border-satin"
                    aria-label={item.fullName ?? item.email ?? item.id}
                  />
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {rank != null ? <span className="mr-1.5 font-semibold tabular-nums text-muted-foreground" data-testid="candidate-rank">#{rank}</span> : null}
                    {item.fullName ?? '—'}
                  </p>
                  <CandidateEmailCell candidate={item} onUpdateEmail={onUpdateEmail} updating={updatingCandidateId === item.id} />
                  <CandidateStatusCell candidate={item} onRescreen={onRescreen} rescreeningCandidateId={rescreeningCandidateId} />
                  {item.eligible === false ? <Badge variant="warning" className="mt-1">{t('employer.campaigns.screening.ranking.ineligible')}</Badge> : null}
                  {item.mustHaveTotal ? <p className="text-xs text-muted-foreground">{t('employer.campaigns.screening.ranking.mustHaveCount').replace('{{met}}', String(item.mustHaveMet ?? 0)).replace('{{total}}', String(item.mustHaveTotal))}</p> : null}
                  {item.missingMustHave?.length ? <p className="text-xs text-warning">{t('employer.campaigns.screening.ranking.missingMustHave')}: {item.missingMustHave.join(', ')}</p> : null}
                </TableCell>
                <TableCell className="font-semibold text-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums">{item.overallMatchScore != null ? `${item.overallMatchScore}%` : '—'}</span>
                    <CandidateVerifyFlag risk={item.verificationRisk} />
                  </div>
                </TableCell>
                <TableCell className="max-w-64">
                  {skills.length ? skills.slice(0, SKILLS_SHOWN).join(', ') : '—'}
                  {skills.length > SKILLS_SHOWN ? (
                    <span className="ml-1 text-xs text-muted-foreground" data-testid="candidate-more-skills">
                      {t('employer.campaigns.screening.ranking.moreSkills').replace('{{count}}', String(skills.length - SKILLS_SHOWN))}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Button type="button" size="sm" variant="outline" onClick={() => onViewDetail(item.id)}>
                    {t('employer.campaigns.screening.ranking.viewDetail')}
                  </Button>
                </TableCell>
              </TableRow>
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
      <AppPagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={candidates.length}
        itemLabel={t('employer.campaigns.screening.ranking.itemLabel')}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}

function groupCandidates(candidates: CampaignCandidateListItem[], t: (key: string) => string) {
  const hasMustHave = candidates.some((item) => (item.mustHaveTotal ?? 0) > 0);
  if (!hasMustHave) return [{ key: 'all', title: '', items: candidates }];
  return [
    { key: 'eligible', title: t('employer.campaigns.screening.ranking.group.eligible'), items: candidates.filter((item) => item.eligible !== false && !isUnreadable(item)) },
    { key: 'ineligible', title: t('employer.campaigns.screening.ranking.group.ineligible'), items: candidates.filter((item) => item.eligible === false) },
    { key: 'unreadable', title: t('employer.campaigns.screening.ranking.group.unreadable'), items: candidates.filter((item) => item.eligible !== false && isUnreadable(item)) },
  ].filter((group) => group.items.length > 0);
}

function canSelectRow(
  item: CampaignCandidateListItem,
  allowIneligibleSelection: boolean,
  allowMissingEmailSelection: boolean,
) {
  const candidate = allowIneligibleSelection ? { ...item, eligible: true } : item;
  return canSelectCandidate(
    allowMissingEmailSelection && !candidate.email
      ? { ...candidate, email: 'missing-email@invalid.local' }
      : candidate,
  );
}

export function isUnreadable(item: CampaignCandidateListItem): boolean {
  const status = item.status.toLowerCase();
  return status === 'analyzing' || status === 'analysisfailed' || status === 'filtered' || item.overallMatchScore == null;
}
