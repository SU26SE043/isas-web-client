import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { VerificationRisk } from '../../types/campaign.api.types';
import { verificationRiskTranslationKey } from './screeningUtils';

interface CandidateVerifyFlagProps {
  risk: VerificationRisk | null | undefined;
}

/**
 * Cờ "cần xác minh" cạnh điểm phù hợp — CHỈ hiện khi rủi ro Medium/High.
 *
 * <p>Trước đây badge in thẳng mức rủi ro ("Thấp"/"Cao") ngay sát "90%": HR đọc thành "điểm thấp /
 * điểm cao", và màu xanh = Thấp, đỏ = Cao đảo ngược trực giác "cao là tốt" của cột điểm. Badge
 * "Thấp" (CV có bằng chứng nhất quán) không phải việc HR cần làm gì ⇒ không hiện; chỉ mức cần
 * hỏi kỹ ở vòng phỏng vấn mới đáng chiếm mắt. Mức rủi ro đầy đủ vẫn có ở ngăn chi tiết.</p>
 */
export function CandidateVerifyFlag({ risk }: CandidateVerifyFlagProps) {
  const { t } = useLanguage();
  if (risk !== 'Medium' && risk !== 'High') return null;
  const title = t('employer.campaigns.screening.ranking.verifyFlagTitle').replace(
    '{{level}}',
    t(verificationRiskTranslationKey(risk)).toLowerCase(),
  );
  return (
    <Badge variant={risk === 'High' ? 'destructive' : 'warning'} title={title} data-testid="candidate-verify-flag">
      <TriangleAlert aria-hidden />
      {t(`employer.campaigns.screening.ranking.verifyFlag.${risk}`)}
    </Badge>
  );
}
