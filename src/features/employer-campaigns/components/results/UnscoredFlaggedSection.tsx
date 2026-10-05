import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/patterns/EmptyState';
import { useLanguage } from '@/shared/languages';
import type { CampaignUnscoredFlaggedResult } from '../../types/campaign.api.types';
import { candidateDisplayEmail, candidateDisplayName } from './ResultBadges';
import { UnscoredFlagList, UnscoredStatus } from './UnscoredFlagList';
import { ProctoringDialog } from './proctoring/ProctoringDialog';

export function UnscoredFlaggedSection({
  items,
  campaignId,
}: {
  items: CampaignUnscoredFlaggedResult[];
  /** Có thì mỗi hàng có nút mở popup giám sát (dòng thời gian chạy được cả với buổi chưa chấm/bỏ ngang). */
  campaignId?: string;
}) {
  const { t } = useLanguage();
  const list = items ?? [];
  // `open` tách khỏi `selected`: đóng popup chỉ hạ `open`, giữ buổi đã chọn để nội dung không nháy
  // thành "không có vi phạm" trong lúc popup đang chạy hiệu ứng đóng.
  const [selected, setSelected] = useState<CampaignUnscoredFlaggedResult | null>(null);
  const [open, setOpen] = useState(false);
  const viewButton = (item: CampaignUnscoredFlaggedResult) =>
    campaignId && item.flags.length > 0 ? (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        aria-haspopup="dialog"
        onClick={() => {
          setSelected(item);
          setOpen(true);
        }}
      >
        <ShieldAlert aria-hidden />
        {t('employer.campaigns.results.unscoredFlagged.viewProctoring')}
      </Button>
    ) : null;

  return (
    <section className="space-y-3" aria-labelledby="unscoerror-flagged-heading">
      <div>
        <h3 id="unscoerror-flagged-heading" className="text-lg font-semibold text-foreground">
          {t('employer.campaigns.results.unscoredFlagged.title')}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('employer.campaigns.results.unscoredFlagged.description')}
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          variant="no-data"
          title={t('employer.campaigns.results.unscoredFlagged.emptyTitle')}
          description={t('employer.campaigns.results.unscoredFlagged.emptyDescription')}
        />
      ) : (
        <>
          {/* Desktop: bảng. Mobile: thẻ. Cả hai cùng có trong DOM, CSS ẩn một bên (display:none
              cũng ẩn khỏi cây trợ năng) — test nên khoanh vùng theo data-layout. */}
          <div
            data-layout="table"
            className="hidden overflow-x-auto rounded-xl border border-satin bg-surface-raised md:block"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('employer.campaigns.results.columns.candidate')}</TableHead>
                  <TableHead>{t('employer.campaigns.results.unscoredFlagged.interviewStatus')}</TableHead>
                  <TableHead>{t('employer.campaigns.results.columns.flags')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((item) => (
                  <TableRow key={`${item.candidateId}-${item.sessionId}`}>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">{candidateDisplayName(item, t)}</p>
                        <p className="text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
                      </div>
                    </TableCell>
                    <TableCell title={item.sessionId} className="max-w-64 whitespace-normal">
                      <UnscoredStatus item={item} />
                    </TableCell>
                    <TableCell>
                      <UnscoredFlagList flags={item.flags} />
                      {viewButton(item)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul data-layout="cards" className="space-y-3 md:hidden">
            {list.map((item) => (
              <li
                key={`mobile-${item.candidateId}-${item.sessionId}`}
                className="frame-satin rounded-xl bg-surface-raised p-4"
              >
                {/* Trạng thái đứng DƯỚI tên, không đặt cạnh: ở 375px email dài (không có chỗ ngắt)
                    tràn sang và bị nhãn trạng thái đè lên. Tên ngắt theo TỪ (wrap-anywhere chỉ cắt giữa chữ khi một
                    từ dài hơn cả dòng) — break-all cắt "Hoàng L|ong"; email không có khoảng trắng nên giữ break-all. */}
                <div className="min-w-0">
                  <p className="wrap-anywhere font-medium text-foreground">{candidateDisplayName(item, t)}</p>
                  <p className="break-all text-xs text-muted-foreground">{candidateDisplayEmail(item, t)}</p>
                </div>
                <div title={item.sessionId} className="mt-2">
                  <UnscoredStatus item={item} />
                </div>
                <div className="mt-3 border-t border-satin pt-3">
                  <UnscoredFlagList flags={item.flags} />
                  {viewButton(item)}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      {campaignId && selected ? (
        <ProctoringDialog
          open={open}
          onOpenChange={setOpen}
          campaignId={campaignId}
          sessionId={selected.sessionId}
          flags={selected.flags}
        />
      ) : null}
    </section>
  );
}
