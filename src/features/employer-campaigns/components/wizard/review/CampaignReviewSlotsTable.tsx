import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { CampaignSlotResponse } from '../../../types/campaign.api.types';

interface CampaignReviewSlotsTableProps {
  slots: CampaignSlotResponse[];
  /** id các ca `slotsOutsideCampaignWindow` đã bắt — vẫn LIỆT KÊ, không ẩn: HR cần thấy
   * ĐÚNG CA NÀO để sửa, số đếm đã có ở khối chặn phía trên rồi. */
  outsideIds: string[];
}

function formatSlotTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

/** Bảng ca thi ở bước Review (T12) — chỉ render khi campaign có khai ca (T11: ca là tuỳ chọn). */
export function CampaignReviewSlotsTable({ slots, outsideIds }: CampaignReviewSlotsTableProps) {
  const { t } = useLanguage();
  const outside = new Set(outsideIds);
  const f = 'employer.campaigns.wizard.deploy';
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t(`${f}.slotsTableTime`)}</TableHead>
          <TableHead>{t(`${f}.slotsTableAssigned`)}</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {slots.map((slot) => (
          <TableRow key={slot.id}>
            <TableCell>
              {formatSlotTime(slot.startsAt)} – {formatSlotTime(slot.endsAt)}
            </TableCell>
            <TableCell>
              {slot.assignedCount}/{slot.capacity}
            </TableCell>
            <TableCell>
              {outside.has(slot.id) ? (
                <Badge variant="outline" className="border-error/30 bg-error-bg text-error">
                  {t(`${f}.slotOutsideBadge`)}
                </Badge>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
