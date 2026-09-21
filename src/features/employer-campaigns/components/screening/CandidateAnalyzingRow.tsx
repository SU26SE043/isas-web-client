import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { useLanguage } from '@/shared/languages';
import type { CampaignCandidateListItem } from '../../types/campaign.api.types';
import { candidateScreeningStatusLabelKey } from '../../utils/candidateScreeningStatus';

interface CandidateAnalyzingRowProps {
  candidate: CampaignCandidateListItem;
}

/**
 * Dòng ứng viên ĐANG được AI sàng (Analyzing/Filtered). Đo 21/09: HR vừa bấm Phân tích thấy 4 dòng
 * toàn "—" + ô "Lưu email" trống ⇒ đọc thành "hỏng", dù bảng chỉ đang chờ ~30 s.
 *
 * <p>Cố ý KHÔNG vẽ skeleton từng ô (chủ sản phẩm chê "hơi kì"): 4 thanh mờ giả vờ là dữ liệu sắp
 * có, mà thứ sắp có thật ra chỉ là MỘT việc — AI đang đọc CV. Nên gom điểm/kỹ năng/trạng thái thành
 * một ô: spinner + "Đang phân tích". Email đã tách từ CV thì hiện luôn (dữ liệu thật, HR nhận ra
 * dòng nào là ai). Không tick chọn / không mở chi tiết — chưa có gì để xem, mời lúc này là mời
 * trước khi biết điểm.</p>
 */
export function CandidateAnalyzingRow({ candidate }: CandidateAnalyzingRowProps) {
  const { t } = useLanguage();
  return (
    <TableRow aria-busy="true" data-testid="candidate-analyzing-row" className="text-muted-foreground">
      <TableCell>
        <input type="checkbox" checked={false} disabled readOnly className="size-4 rounded border-satin" aria-label={candidate.email ?? candidate.id} />
      </TableCell>
      <TableCell />
      <TableCell>
        <p className="text-sm">{candidate.email ?? t('employer.campaigns.screening.ranking.noEmail')}</p>
      </TableCell>
      <TableCell colSpan={3}>
        <div className="flex items-center gap-2">
          <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
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
