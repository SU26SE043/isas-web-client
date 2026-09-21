import { Info, Rocket } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { SectionPanel } from '@/components/ui/section-panel';
import { isCampaignSlotsUiEnabled } from '@/shared/config';
import { useLanguage } from '@/shared/languages';
import type { CampaignQuestion, RubricCriterion } from '../../types/campaignManagement.types';
import type { FailedCampaignInvitation } from '../../types/campaign.api.types';
import type { CampaignInfoState, CampaignSettingsState, JobDescriptionState } from '../../types/campaignWizard.types';
import { useCampaignSlots } from '../../hooks/useCampaignSlots';
import { calculateAdaptiveQuestionBudget } from '../../utils/campaignAdaptiveBudget';
import { campaignSlotCapacity } from '../../utils/campaignSlots';
import { inviteSlotShortfall, slotsOutsideCampaignWindow } from '../../utils/campaignCapacityChecks';
import { isCampaignExpiryPast } from '../../utils/campaignWindow';
import { computeLocalKRule, formatKRuleMessage, splitQuestionBankWarnings } from '../../utils/questionCoverage';
import { CampaignWizardNav } from './CampaignWizardNav';
import { CampaignReviewSlotsTable } from './review/CampaignReviewSlotsTable';
import { QuestionPreviewSummaryLine } from './review/QuestionPreviewSummaryLine';

interface CampaignReviewStepProps {
  info: CampaignInfoState; jd: JobDescriptionState; rubric: RubricCriterion[]; questions: CampaignQuestion[];
  questionsPerSession?: number | null; settings: CampaignSettingsState; campaignId?: string; domainLabel: string;
  inviteEmails?: string[]; questionBankWarnings?: string[]; error?: string | null; onGoToStep: (step: number) => void;
  onBack: () => void; onSubmit: () => void; submitLabel: string; submittingLabel: string;
  isSubmitting?: boolean; submitDisabled?: boolean; disableForBlockingIssues?: boolean;
  hasPartialDeploy?: boolean; onRetryInvitations?: () => void; invitationFailures?: FailedCampaignInvitation[];
  invitationFailureReason?: string | null; canRetryInvitations?: boolean;
  /** Mốc "bây giờ" (ms) cho luật hạn nộp — test truyền vào; mặc định đồng hồ máy. */
  now?: number;
}

interface BlockingItem { key: string; label: string; step: number; /** Có ⇒ `label` là câu thường, chỉ vế này thành link (câu dài không nên gạch chân cả đoạn). */ linkLabel?: string; }

/** Giờ + ngày, KHÔNG giây (giây là nhiễu ở màn kiểm tra); chuỗi hỏng trả nguyên để HR còn nhìn thấy nó sai. */
function formatDate(value: string, language: string | undefined): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  // Năm ĐỦ 4 số: `dateStyle: 'short'` của vi-VN in "13/9/26" — hai số cuối dễ đọc nhầm thành ngày.
  return new Intl.DateTimeFormat(language === 'vi' ? 'vi-VN' : 'en-US', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

/**
 * Bước cuối: MỘT nút Triển khai (ở footer) — ô "Khi bấm Triển khai" chỉ mô tả hậu quả bằng số cụ thể.
 * Rà 21/09: trang có hai nút đen cùng tên + ô "Mở ngay khi triển khai" gần như luôn bị khoá (giờ mở mặc
 * định = lúc mở wizard + 1' nên tới bước này đã qua) mà khi giờ mở ở tương lai lại TỰ tick (D-6) ⇒ HR
 * hẹn 9:00 mai, bấm Triển khai là mở ngay. Bỏ ô đó; muốn mở sớm thì sửa giờ bắt đầu, hoặc dùng nút
 * "Mở ngay" ở trang chi tiết khi campaign đã Active.
 */
export function CampaignReviewStep({
  info, jd, rubric, questions, questionsPerSession, settings, campaignId, domainLabel,
  inviteEmails = [], questionBankWarnings = [], error, onGoToStep, onBack, onSubmit,
  submitLabel, submittingLabel, isSubmitting = false, submitDisabled = false, disableForBlockingIssues = false,
  hasPartialDeploy = false, onRetryInvitations,
  invitationFailures = [], invitationFailureReason = null, canRetryInvitations = true, now,
}: CampaignReviewStepProps) {
  const { t, language } = useLanguage();
  // Khung giờ tạm ẩn ⇒ Review coi như 0 ca: không query, không bảng ca, không chặn theo ca (xem isCampaignSlotsUiEnabled).
  const slotsUi = isCampaignSlotsUiEnabled();
  const slotsQuery = useCampaignSlots(campaignId, Boolean(campaignId) && slotsUi);
  // T12 R2: đang TẢI hoặc LỖI ⇒ coi như "chưa biết ca nào" (`[]`), KHÔNG PHẢI "0 ca thật" —
  // không thể chặn triển khai bằng dữ liệu ca CHƯA CÓ. Nhánh 0-ca của `inviteSlotShortfall`/
  // `slotsOutsideCampaignWindow` tự nhiên trả "không có gì để chặn" cho đúng ca này, nên
  // KHÔNG cần đọc `slotsQuery.isLoading`/`isError` ở đâu khác trong file này.
  const slots = slotsUi ? (slotsQuery.data ?? []) : [];
  const slotCapacitySummary = campaignSlotCapacity(slots);
  const capacity = slotCapacitySummary.total;
  const assignedCount = slots.reduce((sum, slot) => sum + slot.assignedCount, 0);
  const outsideWindowSlots = slotsOutsideCampaignWindow(slots, info.startsAt, info.expiresAt);
  const slotShortfall = inviteSlotShortfall(slots, inviteEmails.length);
  const adaptiveBudget = calculateAdaptiveQuestionBudget(
    questionsPerSession ?? questions.length,
    settings.maxDeepPerQuestion,
    settings.adaptiveEnabled,
    settings.maxQuestions,
  );
  // SC2 · D-5 — K-rule tính CỤC BỘ từ state (nhãn mới nhất, kể cả chưa lưu) để chặn NGAY ở bước 8 bằng chữ
  // người đọc được; bản server (`questionBankWarnings`, có tiền tố mã) chỉ dùng khi state không tự tính được
  // (không rubric) — và luôn bỏ tiền tố mã trước khi hiện. Cảnh báo mềm của server giữ nguyên chữ.
  const localK = computeLocalKRule(questions, questionsPerSession, rubric);
  const serverWarnings = splitQuestionBankWarnings(questionBankWarnings);
  // Có rubric ⇒ bản cục bộ là sự thật (kể cả khi server còn giữ cảnh báo cũ của lần lưu trước); không rubric ⇒ tin server.
  const kRuleLabel = localK ? formatKRuleMessage(t, localK) : rubric.length > 0 ? null : serverWarnings.blocking[0] ?? null;
  const formattedStart = formatDate(info.startsAt, language);
  const formattedExpires = formatDate(info.expiresAt, language);
  const expired = isCampaignExpiryPast(info.expiresAt, now);
  const blocking: BlockingItem[] = [
    // Hạn nộp đã qua đứng ĐẦU: phát hành xong là mọi lời mời chết ngay, và BE PUT/publish không chặn hộ.
    expired ? { key: 'expired', label: t('employer.campaigns.wizard.deploy.blockExpired').replace('{{expires}}', formattedExpires), step: 0, linkLabel: t('employer.campaigns.wizard.deploy.blockExpiredLink') } : null,
    kRuleLabel ? { key: 'kRule', label: kRuleLabel, step: 3, linkLabel: t('employer.campaigns.review.previewSummary.goToQuestions') } : null,
    !jd.jdText.trim() && !jd.fileName && !jd.serverUploaded ? { key: 'jd', label: t('employer.campaigns.wizard.jdTextRequired'), step: 1 } : null,
    rubric.length === 0 ? { key: 'rubric', label: t('employer.campaigns.wizard.criteriaRequired'), step: 2 } : null,
    questions.length === 0 ? { key: 'questions', label: t('employer.campaigns.wizard.questionsRequired'), step: 3 } : null,
    // T12 R2 — hai mục mới CÙNG step=5 ("Sức chứa & ca thi", index 5 = bước 6) nên phải có
    // `key` riêng: `<li key={item.step}>` cũ sẽ đụng nhau khi hai mục có cùng step.
    slotShortfall > 0
      ? {
          key: 'slotShortfall',
          label: t('employer.campaigns.wizard.deploy.blockSlotShortfall')
            .replace('{{inviting}}', String(inviteEmails.length))
            .replace('{{available}}', String(slotCapacitySummary.available)),
          step: 5,
        }
      : null,
    outsideWindowSlots.length > 0
      ? {
          key: 'slotOutsideWindow',
          label: t('employer.campaigns.wizard.deploy.blockSlotOutsideWindow').replace('{{n}}', String(outsideWindowSlots.length)),
          step: 5,
        }
      : null,
  ].filter((item): item is BlockingItem => Boolean(item));
  const deployDisabled = submitDisabled || isSubmitting || (hasPartialDeploy && !canRetryInvitations) || (!hasPartialDeploy && ((disableForBlockingIssues && blocking.length > 0) || adaptiveBudget.exceedsLimit));
  const scheduleValue = slots.length > 0
    ? t('employer.campaigns.wizard.deploy.scheduleSlots')
        .replace('{{n}}', String(slots.length))
        .replace('{{assigned}}', String(assignedCount))
        .replace('{{capacity}}', String(capacity))
    : t('employer.campaigns.wizard.deploy.scheduleWindow').replace('{{start}}', formattedStart).replace('{{expires}}', formattedExpires);
  const questionsValue = questionsPerSession
    ? t('employer.campaigns.wizard.deploy.questionsDraw').replace('{{n}}', String(questions.length)).replace('{{k}}', String(questionsPerSession))
    : t('employer.campaigns.wizard.deploy.questionsAll').replace('{{n}}', String(questions.length));
  const invitesValue = inviteEmails.length > 0
    ? `${inviteEmails.length} ${t('employer.campaigns.wizard.deploy.candidates')}`
    : t('employer.campaigns.wizard.deploy.noInvites');
  const whenPressed = (inviteEmails.length > 0
    ? t('employer.campaigns.wizard.deploy.whenPressedDescription').replace('{{count}}', String(inviteEmails.length))
    : t('employer.campaigns.wizard.deploy.whenPressedNoInvites'))
    .replace('{{start}}', formattedStart)
    .replace('{{expires}}', formattedExpires);

  return (
    <SectionPanel icon={<Rocket className="size-4" aria-hidden />} title={t('employer.campaigns.wizard.deploy.title')} description={t('employer.campaigns.wizard.deploy.description')} footer={<CampaignWizardNav onBack={onBack} onNext={onSubmit} nextLabel={isSubmitting ? submittingLabel : submitLabel} nextDisabled={deployDisabled} isSaving={isSubmitting} backDisabled={isSubmitting} />}>
      <div className="space-y-5">
        {error ? <Alert variant="error"><AlertDescription>{error}</AlertDescription></Alert> : null}
        {hasPartialDeploy ? <Alert variant="warning">
          <AlertTitle>{invitationFailures.length > 0 ? t('employer.campaigns.wizard.deploy.partialInvitationTitle') : t('employer.campaigns.wizard.deploy.invitationFailed')}</AlertTitle>
          <AlertDescription>
            <p>{invitationFailureReason || (invitationFailures.length > 0 ? t('employer.campaigns.wizard.deploy.partialInvitationDescription') : t('employer.campaigns.wizard.deploy.invitationFailed'))}</p>
            {invitationFailures.length > 0 ? <ul className="mt-2 list-inside list-disc space-y-1">{invitationFailures.map((item) => <li key={`${item.email}-${item.reason}`}><span className="font-medium text-foreground">{item.email}</span>: {item.reason}</li>)}</ul> : null}
            {!canRetryInvitations ? <p className="mt-2">{t('employer.campaigns.wizard.deploy.invitationFixRequired')}</p> : null}
            {canRetryInvitations && onRetryInvitations ? <Button type="button" variant="outline" className="mt-3" disabled={isSubmitting} loading={isSubmitting} onClick={onRetryInvitations}>{t('employer.campaigns.wizard.deploy.retryInvitations')}</Button> : null}
          </AlertDescription>
        </Alert> : null}
        {blocking.length ? <section className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-foreground"><h3 className="mb-1 font-medium leading-none">{t('employer.campaigns.wizard.deploy.blockingTitle')}</h3><ul className="list-inside list-disc space-y-1 text-muted-foreground">{blocking.map((item) => <li key={item.key}>{item.linkLabel ? <>{item.label} <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={() => onGoToStep(item.step)}>{item.linkLabel}</button></> : <button type="button" className="underline" onClick={() => onGoToStep(item.step)}>{item.label}</button>}</li>)}</ul></section> : null}
        {slots.length > 0 ? <CampaignReviewSlotsTable slots={slots} outsideIds={outsideWindowSlots.map((slot) => slot.id)} /> : null}
        {serverWarnings.soft.length ? <Alert variant="warning"><AlertTitle>{t('employer.campaigns.wizard.deploy.warningTitle')}</AlertTitle><AlertDescription><ul className="list-inside list-disc">{serverWarnings.soft.map((warning) => <li key={warning}>{warning}</li>)}</ul></AlertDescription></Alert> : null}
        {settings.adaptiveEnabled ? <section className="frame-satin space-y-2 rounded-xl bg-surface-overlay p-4" aria-label={t('employer.campaigns.wizard.review.adaptiveBudget')}>
          <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-foreground">{t('employer.campaigns.wizard.review.adaptiveBudget')}: {adaptiveBudget.requestedTotal}</h3><span className="text-sm text-muted-foreground">{adaptiveBudget.requestedTotal} / {adaptiveBudget.limit}</span></div>
          {adaptiveBudget.maxDeepPerQuestion > 0 ? <p className="text-sm text-muted-foreground">maxDeepPerQuestion: {adaptiveBudget.maxDeepPerQuestion}</p> : null}
          {adaptiveBudget.maxDeepPerQuestion > 0 ? <p className="text-sm text-muted-foreground">{t('employer.campaigns.wizard.review.adaptiveBudgetFormula').replace('{{base}}', String(adaptiveBudget.baseQuestionCount)).replace('{{depth}}', String(adaptiveBudget.maxDeepPerQuestion)).replace('{{total}}', String(adaptiveBudget.requestedTotal))}</p> : null}
          <p className="text-sm text-muted-foreground">{t('employer.campaigns.wizard.review.adaptiveBudgetSummary').replace('{{base}}', String(adaptiveBudget.baseQuestionCount)).replace('{{depth}}', String(adaptiveBudget.maxDeepPerQuestion)).replace('{{requested}}', String(adaptiveBudget.requestedTotal)).replace('{{limit}}', String(adaptiveBudget.limit)).replace('{{status}}', t(adaptiveBudget.exceedsLimit ? 'employer.campaigns.wizard.review.adaptiveBudgetStatus.exceeded' : 'employer.campaigns.wizard.review.adaptiveBudgetStatus.ok'))}</p>
          {adaptiveBudget.exceedsLimit ? <Alert variant="error"><AlertDescription>{t('employer.campaigns.wizard.review.adaptiveBudgetExceeded').replace('{{requested}}', String(adaptiveBudget.requestedTotal)).replace('{{limit}}', String(adaptiveBudget.limit))}</AlertDescription></Alert> : null}
        </section> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryCampaign')} value={info.title || '—'} onEdit={() => onGoToStep(0)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          {/* Ca thi ẩn ⇒ bước 5 không tới được (goToStep từ chối) — "Sửa" trỏ về bước 1, nơi đặt cửa sổ thi (startsAt/expiresAt). */}
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summarySchedule')} value={scheduleValue} tone={expired ? 'error' : 'default'} onEdit={() => onGoToStep(slotsUi ? 5 : 0)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryInvites')} value={invitesValue} onEdit={() => onGoToStep(6)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryJob')} value={`${domainLabel} · ${jd.fileName || (jd.jdText.trim() ? t('employer.campaigns.wizard.deploy.jdTyped') : '—')}`} onEdit={() => onGoToStep(1)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryCriteria')} value={t('employer.campaigns.wizard.deploy.criteriaCount').replace('{{n}}', String(rubric.length))} onEdit={() => onGoToStep(2)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
          <SummaryCard label={t('employer.campaigns.wizard.deploy.summaryQuestions')} value={questionsValue} onEdit={() => onGoToStep(3)} editLabel={t('employer.campaigns.wizard.deploy.edit')} />
        </div>
        {/* SC2 · D-1 — bước 8 chỉ TÓM TẮT chấm thử theo câu (n/K câu đã thử · m câu chưa gắn tiêu chí), không chặn Phát hành. */}
        <QuestionPreviewSummaryLine campaignId={campaignId ?? null} questions={questions} rubric={rubric} onGoToQuestions={() => onGoToStep(3)} />
        <section className="rounded-xl border border-info/30 bg-info/5 p-4" data-testid="deploy-consequences">
          <div className="flex items-start gap-3"><Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden /><div className="space-y-2 text-sm"><h3 className="font-semibold text-foreground">{t('employer.campaigns.wizard.deploy.whenPressedTitle')}</h3><p className="text-muted-foreground">{whenPressed}</p><p className="text-muted-foreground">{t('employer.campaigns.wizard.deploy.lockingDescription')}</p></div></div>
        </section>
      </div>
    </SectionPanel>
  );
}

function SummaryCard({ label, value, onEdit, editLabel, tone = 'default' }: { label: string; value: string; onEdit: () => void; editLabel: string; tone?: 'default' | 'error' }) {
  return <div className="frame-satin rounded-xl bg-surface-overlay p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className={`mt-1 line-clamp-2 text-sm font-medium ${tone === 'error' ? 'text-error' : 'text-foreground'}`}>{value}</p></div><Button type="button" variant="ghost" size="sm" onClick={onEdit}>{editLabel}</Button></div></div>;
}
