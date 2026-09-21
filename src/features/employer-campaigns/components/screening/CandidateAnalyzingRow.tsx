import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { candidateScreeningStatusLabelKey } from '../../utils/candidateScreeningStatus';

interface CandidateAnalyzingRowProps {
  candidate: CampaignCandidateListItem;
}

/**
 * Dòng ứng viên ĐANG được AI sàng (Analyzing/Filtered): mọi ô chưa có dữ liệu vẽ skeleton + spinner
 * thay vì "—" và ô "Lưu email" trống. Đo 21/09: HR vừa bấm Phân tích thấy 4 dòng toàn gạch ngang và
 * ô nhập email rỗng ⇒ đọc thành "hỏng", dù bảng chỉ đang chờ ~30 s. Email đã tách được từ CV thì hiện
 * luôn (là dữ liệu thật), tên/điểm/kỹ năng chờ AI. Không cho tick chọn hay mở chi tiết — chưa có gì
 * để xem, mời lúc này là mời trước khi biết điểm.
 */
export function CandidateAnalyzingRow({ candidate }: CandidateAnalyzingRowProps) {
  const { t } = useLanguage();
  return (
    <TableRow aria-busy="true" data-testid="candidate-analyzing-row">
      <TableCell>
        <input type="checkbox" checked={false} disabled readOnly className="size-4 rounded border-satin" aria-label={candidate.email ?? candidate.id} />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-6" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
        {candidate.email ? (
          <p className="mt-2 text-xs text-muted-foreground">{candidate.email}</p>
        ) : (
          <Skeleton className="mt-2 h-3 w-48" />
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2 text-foreground">
          <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-hidden />
          <span>{t(candidateScreeningStatusLabelKey(candidate.status))}</span>
        </div>
      </TableCell>
      <TableCell>
        <Button type="button" size="sm" variant="outline" disabled>
          {t('employer.campaigns.screening.ranking.viewDetail')}
        </Button>
      </TableCell>
    </TableRow>
  );
}
