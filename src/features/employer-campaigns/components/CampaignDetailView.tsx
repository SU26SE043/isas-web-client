import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarDays,
  Clock3,
  LayoutGrid,
  ListChecks,
  MessageSquareText,
  Settings,
  Trophy,
  UsersRound,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/shared/languages';
import { CampaignDetailActions } from './CampaignDetailActions';
import { CampaignAttachmentsCard } from './CampaignAttachmentsCard';
import { CampaignSlotsPanel } from './slots/CampaignSlotsPanel';
import { CampaignDetailMetric } from './CampaignDetailMetric';
import { CampaignOverviewDescription } from './CampaignOverviewDescription';
import { CollapsibleDetailCard } from './CollapsibleDetailCard';
import { CampaignScoringRulesCard } from './CampaignScoringRulesCard';
import { CampaignJobNeedsCard } from './CampaignJobNeedsCard';
import { CampaignDetailStatusNotices } from './CampaignDetailStatusNotices';
import { useCampaignSlots } from '../hooks/useCampaignSlots';
import { CampaignDetailQuestionsSection } from './detail/CampaignDetailQuestionsSection';
import type { CampaignStatusUpdateRequest } from '../types/campaign.api.types';
import type { EmployerCampaign } from '../types/campaignManagement.types';
interface CampaignDetailViewProps {
  campaign: EmployerCampaign;
  published: boolean;
  warnings: string[];
  onPublish: () => Promise<void>;
  onChangeStatus: (status: CampaignStatusUpdateRequest['status']) => Promise<void>;
  onDelete?: () => Promise<void>;
  embedded?: boolean;
  onStartNow?: () => Promise<void>;
  startingNow?: boolean;
  /** Mở wizard ở bước Tiêu chí để khai mốc (chỉ Draft — wizard từ chối campaign đã mở). */
  onEditCriteria?: () => void;
}

export function CampaignDetailView({
  campaign,
  published,
  warnings,
  onPublish,
  onChangeStatus,
  onDelete,
  embedded = false,
  onStartNow,
  startingNow = false,
  onEditCriteria,
}: CampaignDetailViewProps) {
  const { t, language } = useLanguage();
  // T13 R2 — cùng query key với CampaignSlotsPanel bên dưới (React Query dedup, không thêm request):
  // "Mở ngay" phải nhìn thấy ca để khoá. Đang tải/lỗi ⇒ 0 (backend vẫn chặn 409 làm lớp hai).
  const slotsQuery = useCampaignSlots(campaign.id);
  const slotCount = slotsQuery.data?.length ?? 0;
  const isDraft = campaign.status === 'draft';
  const hasDetailActions =
    campaign.status === 'draft' ||
    campaign.status === 'closed' ||
    campaign.status === 'archived';
  const formattedDeadline = new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(campaign.deadline));
  const formattedStart = campaign.startsAt
    ? new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(campaign.startsAt))
    : '—';

  const content = (
    <div className="space-y-4">
        {hasDetailActions ? <div className="flex justify-end">
          <CampaignDetailActions
            campaign={campaign}
            onPublish={onPublish}
            onChangeStatus={onChangeStatus}
            onDelete={onDelete}
          />
        </div> : null}

        <CampaignDetailStatusNotices campaign={campaign} published={published} warnings={warnings} formattedStart={formattedStart} onStartNow={onStartNow} startingNow={startingNow} slotCount={slotCount} />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,1fr)]">
          <Card className="frame-satin bg-info/[0.035]">
            <CardHeader className="pb-3">
              <IconTitle icon={LayoutGrid} tone="info">
                {t('employer.campaigns.detail.overview')}
              </IconTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <CampaignOverviewDescription
                description={
                  campaign.jobDescription || t('employer.campaigns.detail.noJobDescription')
                }
              />
              <div className="grid gap-3 md:grid-cols-3">
                <CampaignDetailMetric
                  icon={UsersRound}
                  label={t('employer.campaigns.list.capacity')}
                  // capacity=0 (`campaignMapper.ts` sentinel cho `maxCandidates` chưa khai — nay
                  // TUỲ CHỌN) nghĩa là "không trần riêng", không phải "sức chứa bằng không".
                  value={`${campaign.cvCount ?? 0}/${campaign.capacity > 0 ? campaign.capacity : '—'}`}
                />
                <CampaignDetailMetric
                  icon={Clock3}
                  label={t('employer.campaigns.form.duration')}
                  value={`${campaign.durationMinutes}`}
                />
                <CampaignDetailMetric
                  icon={MessageSquareText}
                  label={t('employer.campaigns.form.questionsUnit')}
                  value={`${campaign.questions.length}`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="frame-satin bg-surface-raised">
            <CardHeader className="pb-3">
              <IconTitle icon={Settings} tone="info">
                {t('employer.campaigns.detail.settings')}
              </IconTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-info-light" aria-hidden />
                <span>{t('employer.campaigns.form.startsAt')}:</span>
                <strong className="font-semibold text-foreground">{formattedStart}</strong>
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="size-4 shrink-0 text-info-light" aria-hidden />
                <span>{t('employer.campaigns.form.deadline')}:</span>
                <strong className="font-semibold text-foreground">{formattedDeadline}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Building2 className="size-4 shrink-0 text-info-light" aria-hidden />
              </p>
              <p className="text-muted-foreground">
                {t('employer.campaigns.form.passScorePct')}:{' '}
                <strong className="font-semibold text-foreground">
                  {campaign.passScorePct != null ? `${campaign.passScorePct}%` : '—'}
                </strong>
              </p>
              <p className="text-muted-foreground">
                {t('employer.campaigns.form.antiCheat')}:{' '}
                <strong className="font-semibold text-foreground">
                  {campaign.antiCheatEnabled
                    ? t('employer.campaigns.detail.enabled')
                    : t('employer.campaigns.detail.disabled')}
                </strong>
              </p>
              <p className="text-muted-foreground">
                {t('employer.campaigns.form.faceVerify')}:{' '}
                <strong className="font-semibold text-foreground">
                  {campaign.faceVerifyEnabled
                    ? t('employer.campaigns.detail.enabled')
                    : t('employer.campaigns.detail.disabled')}
                </strong>
              </p>
            </CardContent>
          </Card>
        </div>

        <CampaignSlotsPanel campaignId={campaign.id} editable={isDraft} />

        <CampaignAttachmentsCard campaignId={campaign.id} />

        <CampaignJobNeedsCard key={campaign.id} campaignId={campaign.id} initialNeeds={campaign.jobNeeds} editable={isDraft} />

        <CampaignScoringRulesCard campaign={campaign} />
        <CollapsibleDetailCard
          title={t('employer.campaigns.detail.rubric')}
          icon={Trophy}
          className="frame-satin bg-chart-cat-6/[0.035]"
        >
          <div className="space-y-3">
            {campaign.rubric.map((item) => (
              <div key={item.id} className="rounded-lg border border-satin bg-surface-overlay px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  {item.name} · {item.levels?.length ? `${item.levels.length} ${t('employer.campaigns.detail.rubricLevels')}` : t('employer.campaigns.detail.rubricNoLevels')} · {item.minPct != null ? `${t('employer.campaigns.detail.rubricFloor')} ${item.minPct}%` : t('employer.campaigns.detail.rubricNoFloor')} ·{' '}
                  {Number(item.weight) <= 1
                    ? `${Math.round(Number(item.weight) * 100)}%`
                    : `${Math.round(Number(item.weight) * 100) / 100}%`}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CollapsibleDetailCard>
        <CampaignDetailQuestionsSection campaign={campaign} onEditCriteria={isDraft ? onEditCriteria : undefined} />
        <CollapsibleDetailCard
          title={t('employer.campaigns.detail.questions')}
          icon={ListChecks}
          className="frame-satin bg-chart-cat-6/[0.025]"
        >
          <div className="space-y-2">
              <p className="mb-2 text-xs text-muted-foreground">{t('employer.campaigns.detail.questionBank').replace('{{k}}', String(campaign.questionBank?.questionsPerSession ?? campaign.questionsPerSession ?? campaign.questions.length)).replace('{{total}}', String(campaign.questionBank?.total ?? campaign.questions.length)).replace('{{always}}', String(campaign.questionBank?.alwaysAsked ?? campaign.questions.filter((item) => item.isRequired).length)).replace('{{groups}}', String(campaign.questionBank?.groups?.length ?? new Set(campaign.questions.map((item) => item.questionGroup || 'Chung')).size))}</p>
              {campaign.questions.map((item, index) => (
              <p key={item.id} className="text-sm text-foreground">
                {index + 1}. {item.prompt}
              </p>
            ))}
          </div>
        </CollapsibleDetailCard>
      </div>
  );

  if (embedded) return content;

  return (
    <div className="h-full overflow-y-auto bg-surface-base">
      <div className="app-page">{content}</div>
    </div>
  ); }

function IconTitle({
  children,
  icon: Icon,
  tone,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
  tone: 'info' | 'violet';
}) {
  const toneClass =
    tone === 'info'
      ? 'border-info/30 bg-info/15 text-info-light'
      : 'border-chart-cat-6/30 bg-chart-cat-6/15 text-chart-cat-6';
  return (
    <CardTitle className="flex items-center gap-3">
      <span className={`flex size-9 items-center justify-center rounded-lg border ${toneClass}`}>
        <Icon className="size-4" aria-hidden />
      </span>
      {children}
    </CardTitle>
  );
}
