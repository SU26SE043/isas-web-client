import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { useToasterStore } from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { useCampaignWizard, type CampaignFormMode } from '../../hooks/useCampaignWizard';
import type { EmployerCampaign } from '../../types/campaignManagement.types';
import type { CampaignCreateQuestionRequest, CampaignQuestionImportResult, CampaignCreateRequest, CampaignUpdateRequest, GenerateCampaignQuestionsParams } from '../../types/campaign.api.types';
import { CampaignWizardShell } from './CampaignWizardShell';
import { CampaignWizardStepContent } from './CampaignWizardStepContent';

interface CampaignWizardFormProps {
  campaign?: EmployerCampaign | null;
  mode: CampaignFormMode;
  /** Bước mở đầu (0-based), chỉ chế độ edit — xem `useCampaignWizard`. */
  initialStep?: number;
  /** Deep-link `?question=<id>` — mở đúng card câu hỏi ở bước 4 (SC2 · T9). */
  initialQuestionId?: string | null;
  onCreateCampaign: (input: CampaignCreateRequest) => Promise<EmployerCampaign>;
  onUpdateCampaign: (campaignId: string, payload: CampaignUpdateRequest) => Promise<EmployerCampaign>;
  onUpdateQuestions: (campaignId: string, questions: CampaignCreateQuestionRequest[]) => Promise<EmployerCampaign>;
  onGenerateQuestions: (params: GenerateCampaignQuestionsParams) => Promise<EmployerCampaign>;
  onImportQuestions: (campaignId: string, file: File) => Promise<CampaignQuestionImportResult>;
  onUploadFiles: (campaignId: string, files: { jdFile?: File | null; criteriaFile?: File | null }) => Promise<EmployerCampaign>;
  onReplaceFiles: (campaignId: string, files: { jdFile?: File | null; criteriaFile?: File | null }) => Promise<EmployerCampaign>;
  onDownloadFile: (campaignId: string, fileType: 'jd' | 'criteria') => Promise<import('../../utils/campaignFiles').BlobDownloadResult>;
  onAfterSubmit: (campaign: EmployerCampaign) => void;
  onDeployCampaign: (campaignId: string, emails: string[]) => Promise<import('../../types/campaignManagement.types').CampaignDeployResult>;
  onSendInvitations: (campaignId: string, emails: string[]) => Promise<import('../../types/campaign.api.types').CreateCampaignInvitationsResponse>;
}

/**
 * Dọn toast THÀNH CÔNG còn nổi khi wizard chuyển sang bước khác.
 *
 * ĐÂY LÀ CẢI THIỆN NGỮ NGHĨA — KHÔNG PHẢI VÁ LỖI "TOAST BỊ TREO".
 * Toast tự tắt sau 4s (`ToastProvider`). Ảnh chụp e2e thấy hai toast chồng nhau ở
 * bước 6 chỉ vì kịch bản tự động nhảy qua các bước trong ~1-2 giây, chưa kịp hết
 * 4s; người dùng thật đi chậm hơn thế nhiều. Thứ thật sự sai là ngữ nghĩa: toast
 * nói về việc của bước VỪA RỜI mà lại nổi trên bước mới. Đừng đi tìm bug
 * "toast không tự tắt" — không có bug đó, và đừng đổi `duration` toàn cục.
 *
 * CHỈ dọn toast `success`, CỐ Ý KHÔNG dùng `toast.dismiss()` không tham số:
 * `CampaignWizardPage` dùng `useEmployerCampaign`, mà hook đó bắn `toast.error`
 * từ một `useEffect` phản ứng trạng thái react-query
 * (`useEmployerCampaigns.ts:122`). Nghĩa là toast lỗi có thể nổi lên bất kỳ lúc
 * nào do refetch nền (đổi focus cửa sổ, có mạng lại) — dismiss toàn cục sẽ nuốt
 * mất đúng thứ người dùng cần đọc. Mất một toast success là vô hại; mất một toast
 * lỗi thì không.
 */
export function useDismissStepSuccessToasts(step: number) {
  const { toasts } = useToasterStore();
  // Giữ trong ref chứ KHÔNG đưa `toasts` vào deps: làm vậy thì effect chạy lại mỗi
  // lần có toast mới và dọn ngay cả toast vừa bắn ở CÙNG một bước.
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;
  const previousStepRef = useRef(step);

  useEffect(() => {
    if (previousStepRef.current === step) return; // lần mount đầu: chưa đổi bước
    previousStepRef.current = step;
    for (const item of toastsRef.current) {
      if (item.visible && item.type === 'success') toast.dismiss(item.id);
    }
  }, [step]);
}

export function CampaignWizardForm({ campaign, mode, initialStep, initialQuestionId, onCreateCampaign, onUpdateCampaign, onUpdateQuestions, onGenerateQuestions, onImportQuestions, onUploadFiles, onReplaceFiles, onDownloadFile, onAfterSubmit, onDeployCampaign, onSendInvitations }: CampaignWizardFormProps) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const wizard = useCampaignWizard({ campaign, mode, initialStep, onCreateCampaign, onUpdateCampaign, onUpdateQuestions, onGenerateQuestions, onImportQuestions, onUploadFiles, onReplaceFiles, onDownloadFile, onAfterSubmit, onDeployCampaign, onSendInvitations });
  const { state, step } = wizard;
  useDismissStepSuccessToasts(step);
  const finalSubmitLabel = t('employer.campaigns.wizard.deploy.action');
  const finalLoadingLabel = t('employer.campaigns.wizard.deploy.deploying');
  return <CampaignWizardShell currentStep={step} errorSteps={wizard.errorSteps} campaignName={state.info.title} isEditing={mode === 'edit'} autosaveStatus={state.autosaveStatus} lastSavedAt={state.lastSavedAt} completedSteps={wizard.completedSteps} onStepChange={wizard.goToStep}>
    <CampaignWizardStepContent campaign={campaign} wizard={wizard} onCancel={() => navigate('/employer/campaigns')} finalSubmitLabel={finalSubmitLabel} finalLoadingLabel={finalLoadingLabel} initialQuestionId={initialQuestionId} />
  </CampaignWizardShell>;
}
