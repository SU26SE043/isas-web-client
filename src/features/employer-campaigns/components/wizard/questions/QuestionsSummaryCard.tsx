import { useLanguage } from '@/shared/languages';
import { CampaignManagementStatusBadge } from '../../CampaignManagementStatusBadge';
import { CAMPAIGN_QUESTION_HARD_MAX } from '../../../utils/campaignQuestionLimits';

interface QuestionsSummaryCardProps {
  campaignTitle: string;
  domainLabel: string;
  isDraft: boolean;
  hasJd: boolean;
  questionCount: number;
}

export function QuestionsSummaryCard({
  campaignTitle,
  domainLabel,
  isDraft,
  hasJd,
  questionCount,
}: QuestionsSummaryCardProps) {
  const { t } = useLanguage();
  // UX3-F3 — "Giới hạn câu hỏi" là trần của NGÂN HÀNG ĐỀ, tức cùng con số mà
  // CampaignQuestionsStep dùng để chặn: CAMPAIGN_QUESTION_HARD_MAX.
  //
  // Trước bản này khối tóm tắt tự tính trần riêng bằng effectiveMaxQuestions(settings.maxQuestions)
  // — mặc định 5 — nên nó NÓI DỐI: người dùng thêm được tới 20 câu (bước đã gỡ trần) mà bảng vẫn
  // ghi "Giới hạn câu hỏi 5 · Có thể thêm 5". Hai nguồn sự thật cho một đại lượng; bên hiển thị
  // đọc nhầm bên.
  //
  // `settings.maxQuestions` là trần TỔNG CÂU MỘT BUỔI (gồm cả câu đào sâu), không phải trần số câu
  // HR được nạp — đừng đem nó về đây lần nữa.
  const max = CAMPAIGN_QUESTION_HARD_MAX;
  const remaining = Math.max(max - questionCount, 0);

  return (
    <section className="rounded-lg border border-satin bg-surface-overlay p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          {t('employer.campaigns.campaignQuestions.summary.title')}
        </h3>
        <CampaignManagementStatusBadge status={isDraft ? 'draft' : 'active'} />
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.campaign')}
          value={campaignTitle || '—'}
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.domain')}
          value={domainLabel || '—'}
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.jdStatus')}
          value={
            hasJd
              ? t('employer.campaigns.campaignQuestions.summary.jdAvailable')
              : t('employer.campaigns.campaignQuestions.summary.jdMissing')
          }
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.currentQuestions')}
          value={String(questionCount)}
        />
        <SummaryRow
          label={t('employer.campaigns.campaignQuestions.summary.maximumQuestions')}
          value={
            max == null
              ? t('employer.campaigns.campaignQuestions.summary.defaultLimit')
              : String(max)
          }
        />
        {remaining != null ? (
          <SummaryRow
            label={t('employer.campaigns.campaignQuestions.summary.remainingQuestions')}
            value={String(remaining)}
          />
        ) : null}
      </dl>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm text-foreground">{value}</dd>
    </div>
  );
}
