import { useCallback, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api/apiError';
import type { EmployerCampaign } from '../types/campaignManagement.types';
import type {
  CampaignCreateRequest,
} from '../types/campaign.api.types';
import type {
  CampaignWizardPersistedState,
  CriteriaFileState,
  JobDescriptionState,
} from '../types/campaignWizard.types';
import {
  buildCampaignCreateRequest,
  type CampaignWizardSubmitSnapshot,
} from '../utils/buildCampaignCreateRequest';
import {
  defaultCampaignDownloadName,
  triggerBlobDownload,
  validateCampaignPdf,
  type BlobDownloadResult,
  type CampaignFileType,
} from '../utils/campaignFiles';
import { validateCampaignWizardStep } from '../utils/validateCampaignWizard';
import { adoptServerRubric, type RubricAdoption } from '../utils/serverIdAdoption';

/**
 * R1(a) — kết quả `ensureDraft`: `adopted` chỉ khác null khi CHÍNH lời gọi này vừa POST tạo nháp, và là bản
 * ghép id server tính từ snapshot ĐÃ GỬI (closure của caller) — caller dựng payload PUT từ đó thay vì từ
 * `state` cũ (state đã setState nhưng closure chưa thấy: dùng closure cũ ⇒ PUT criteria KHÔNG echo id ⇒ BE
 * replace-all mint GUID mới ⇒ GUID vừa ghép vào state thành GUID CHẾT).
 */
export type EnsureDraftResult = { id: string; adopted: RubricAdoption | null };

type FilePayload = { jdFile?: File | null; criteriaFile?: File | null };

type UseCampaignFileActionsArgs = {
  state: CampaignWizardPersistedState;
  campaign: EmployerCampaign | null | undefined;
  isDraftEditable: boolean;
  t: (key: string) => string;
  setState: React.Dispatch<React.SetStateAction<CampaignWizardPersistedState>>;
  patchJd: (patch: Partial<JobDescriptionState>) => void;
  patchCriteria: (patch: Partial<CriteriaFileState>) => void;
  setStepError: (message: string | null) => void;
  onCreateCampaign: (input: CampaignCreateRequest) => Promise<EmployerCampaign>;
  onUploadFiles: (campaignId: string, files: FilePayload) => Promise<EmployerCampaign>;
  onReplaceFiles: (campaignId: string, files: FilePayload) => Promise<EmployerCampaign>;
  onDownloadFile: (campaignId: string, fileType: CampaignFileType) => Promise<BlobDownloadResult>;
  snapshot: () => CampaignWizardSubmitSnapshot;
  /**
   * Dịch lỗi của `POST /campaign` (tạo nháp) ra câu + bước cần quay về — wizard truyền `mapSubmitError`
   * vào đây. Tải JD ở bước 2 là lần ĐẦU nháp được tạo, nên lỗi tạo nháp (giờ bắt đầu đã qua, quá
   * trần gói…) nổ ra ngay dưới ô tải tệp. Trước đây mọi lỗi đó bị dán nhãn "không kết nối được máy chủ
   * hoặc hệ thống xử lý file thất bại" (đo trên prod 21/09: BE trả 400 "StartsAt cannot be in the
   * past.", HR đọc thành lỗi mạng, đổi ngày rồi thử lại vẫn thế vì ngày không đổi thật).
   */
  mapCreateError?: (error: unknown) => { message: string; step: number | null };
};

/**
 * Gắn mã lỗi cho lời gọi TẢI TỆP (`POST/PUT …/files`, tải xuống) + giữ nguyên lời server để hiện kèm.
 * `detail` là chữ BE trả về (plain-text 400/500) — chỉ có mã thì "server" không nói được sai ở đâu.
 */
export function mapFileUploadError(error: unknown): { code: string; detail: string | null } {
  const status = getApiStatusCode(error);
  const raw = getApiErrorMessage(error, '').trim();
  const detail = raw || null;
  if (status === 404) return { code: 'notFound', detail: null };
  if (status === 409) return { code: 'notDraft', detail };
  if (status === 400) {
    const message = raw.toLowerCase();
    if (message.includes('10') || message.includes('size') || message.includes('large')) {
      return { code: 'tooLarge', detail: null };
    }
    if (message.includes('pdf')) return { code: 'notPdf', detail: null };
    return { code: 'server', detail };
  }
  return { code: 'server', detail };
}

/**
 * Chia lỗi làm HAI pha: nháp chưa tạo được (`draftFailed`) ≠ file không tải được. Pha nháp đi qua
 * `mapCreateError` để có câu đúng + bước cần sửa; ném lại `DraftPhaseError` để catch ngoài phân biệt.
 */
class DraftPhaseError extends Error {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super('DRAFT_PHASE');
    this.cause = cause;
  }
}

/**
 * JD / Criteria PDF upload, replace, and download — with a single ensure-Draft gate for create mode.
 */
export function useCampaignFileActions({
  state,
  campaign,
  isDraftEditable,
  t,
  setState,
  patchJd,
  patchCriteria,
  setStepError,
  onCreateCampaign,
  onUploadFiles,
  onReplaceFiles,
  onDownloadFile,
  snapshot,
  mapCreateError,
}: UseCampaignFileActionsArgs) {
  const draftIdRef = useRef<string | null>(state.draftId ?? campaign?.id ?? null);
  const draftEnsureRef = useRef<Promise<EnsureDraftResult> | null>(null);
  const jdLockRef = useRef(false);
  const criteriaLockRef = useRef(false);
  const jdDownloadLockRef = useRef(false);
  const criteriaDownloadLockRef = useRef(false);

  useEffect(() => {
    draftIdRef.current = state.draftId ?? campaign?.id ?? null;
  }, [campaign?.id, state.draftId]);

  const ensureDraft = useCallback(async (): Promise<EnsureDraftResult> => {
    if (draftIdRef.current) return { id: draftIdRef.current, adopted: null };

    if (!draftEnsureRef.current) {
      draftEnsureRef.current = (async () => {
        const infoError = validateCampaignWizardStep(state, 0, { mode: 'create' });
        if (infoError) throw new Error(infoError);

        const base = snapshot();
        const questions = base.questions;
        const created = await onCreateCampaign(
          buildCampaignCreateRequest({ ...base, questions }),
        );
        draftIdRef.current = created.id;
        // R1(a) — POST trả bộ tiêu chí ĐÃ có id server: ghép ngay vào state (id tạm → GUID, nhãn câu theo) để mọi
        // đường lưu sau (Triển khai · Lưu câu hỏi · AI sinh câu) thấy GUID. Trước đây chỉ `persistForPreview` ghép,
        // nên create mode giữ id tạm cho tới lúc Lưu & chấm thử ⇒ nhãn mất im lặng ở mọi đường khác.
        const adopted = adoptServerRubric({ rubric: base.rubric, questions }, created.rubric);
        setState((prev) => {
          const own = adoptServerRubric({ rubric: prev.rubric, questions: prev.questions }, created.rubric);
          return {
            ...prev,
            rubric: own.rubric,
            questions: own.questions,
            draftId: created.id,
            lastSavedAt: created.updatedAt,
            autosaveStatus: 'saved',
          };
        });
        return { id: created.id, adopted };
      })().finally(() => {
        draftEnsureRef.current = null;
      });
    }

    return draftEnsureRef.current;
  }, [onCreateCampaign, setState, snapshot, state, t]);

  const ensureDraftId = useCallback(async (): Promise<string> => (await ensureDraft()).id, [ensureDraft]);

  /**
   * Lỗi ở pha TẠO NHÁP: hiện câu đúng ở banner bước + nhảy về bước lỗi (nếu biết), và trả `detail`
   * để ô tệp cũng nói cùng một câu — hai chỗ cùng một lời, không chỗ nào đổ cho "máy chủ".
   */
  const reportDraftFailure = useCallback(
    (error: unknown): { code: string; detail: string | null } => {
      if (error instanceof Error && error.message.startsWith('employer.campaigns.')) {
        setStepError(t(error.message));
        setState((prev) => ({
          ...prev,
          currentStep: 0,
          errorSteps: Array.from(new Set([...prev.errorSteps, 0])),
        }));
        return { code: 'draftFailed', detail: t(error.message) };
      }
      const mapped = mapCreateError?.(error) ?? null;
      const detail = mapped?.message?.trim() || getApiErrorMessage(error, '').trim() || null;
      if (mapped) {
        setStepError(mapped.message);
        if (mapped.step !== null) {
          const step = mapped.step;
          setState((prev) => ({
            ...prev,
            currentStep: step,
            errorSteps: Array.from(new Set([...prev.errorSteps, step])),
          }));
        }
      }
      return { code: 'draftFailed', detail };
    },
    [mapCreateError, setState, setStepError, t],
  );

  const sendJdFile = useCallback(
    async (file: File) => {
      if (jdLockRef.current) return;
      jdLockRef.current = true;
      const replace = Boolean(state.jd.serverUploaded);
      patchJd({
        jdFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileStatus: replace ? 'replacing' : 'uploading',
        fileError: null,
        fileErrorDetail: null,
        uploadProgress: 10,
        inputMethod: 'file',
      });
      try {
        const id = await ensureDraftId().catch((error: unknown) => {
          throw new DraftPhaseError(error);
        });
        let updated: EmployerCampaign;
        if (replace) {
          updated = await onReplaceFiles(id, { jdFile: file });
          toast.success(t('employer.campaigns.files.replaceSuccess'));
        } else {
          updated = await onUploadFiles(id, { jdFile: file });
          toast.success(t('employer.campaigns.files.uploadSuccess'));
        }
        patchJd({
          fileStatus: 'uploaded',
          fileError: null,
          fileErrorDetail: null,
          uploadProgress: 100,
          serverUploaded: true,
          extractedText: updated.jobDescription?.trim().slice(0, 200) ?? '',
        });
        setStepError(null);
      } catch (error) {
        const mapped =
          error instanceof DraftPhaseError ? reportDraftFailure(error.cause) : mapFileUploadError(error);
        patchJd({
          fileStatus: replace ? 'uploaded' : 'failed',
          fileError: mapped.code,
          fileErrorDetail: mapped.detail,
          uploadProgress: null,
        });
      } finally {
        jdLockRef.current = false;
      }
    },
    [
      ensureDraftId,
      onReplaceFiles,
      onUploadFiles,
      patchJd,
      reportDraftFailure,
      setStepError,
      state.jd.serverUploaded,
      t,
    ],
  );

  const sendCriteriaFile = useCallback(
    async (file: File) => {
      if (criteriaLockRef.current) return;
      criteriaLockRef.current = true;
      const replace = Boolean(state.criteria.serverUploaded);
      patchCriteria({
        criteriaFile: file,
        fileName: file.name,
        fileSize: file.size,
        fileStatus: replace ? 'replacing' : 'uploading',
        fileError: null,
        uploadProgress: 10,
      });
      try {
        const id = await ensureDraftId().catch((error: unknown) => {
          throw new DraftPhaseError(error);
        });
        if (replace) {
          await onReplaceFiles(id, { criteriaFile: file });
          toast.success(t('employer.campaigns.files.replaceSuccess'));
        } else {
          await onUploadFiles(id, { criteriaFile: file });
          toast.success(t('employer.campaigns.files.uploadSuccess'));
        }
        patchCriteria({
          fileStatus: 'uploaded',
          fileError: null,
          uploadProgress: 100,
          serverUploaded: true,
        });
        setStepError(null);
      } catch (error) {
        const mapped =
          error instanceof DraftPhaseError ? reportDraftFailure(error.cause) : mapFileUploadError(error);
        patchCriteria({
          fileStatus: replace ? 'uploaded' : 'failed',
          fileError: mapped.code,
          uploadProgress: null,
        });
      } finally {
        criteriaLockRef.current = false;
      }
    },
    [
      ensureDraftId,
      onReplaceFiles,
      onUploadFiles,
      patchCriteria,
      reportDraftFailure,
      setStepError,
      state.criteria.serverUploaded,
      t,
    ],
  );

  const selectJdFile = useCallback(
    (file: File | null) => {
      if (!file) {
        if (state.jd.serverUploaded) return;
        patchJd({
          jdFile: null,
          fileName: null,
          fileSize: null,
          fileStatus: 'idle',
          fileError: null,
          uploadProgress: null,
          serverUploaded: false,
        });
        return;
      }
      const code = validateCampaignPdf(file);
      if (code) {
        patchJd({
          fileName: file.name,
          fileSize: file.size,
          fileStatus: 'failed',
          fileError: code,
          uploadProgress: null,
        });
        return;
      }
      void sendJdFile(file);
    },
    [patchJd, sendJdFile, state.jd.serverUploaded],
  );

  const selectCriteriaFile = useCallback(
    (file: File | null) => {
      if (!file) {
        if (state.criteria.serverUploaded) return;
        patchCriteria({
          criteriaFile: null,
          fileName: null,
          fileSize: null,
          fileStatus: 'idle',
          fileError: null,
          uploadProgress: null,
          serverUploaded: false,
        });
        return;
      }
      const code = validateCampaignPdf(file);
      if (code) {
        patchCriteria({
          fileName: file.name,
          fileSize: file.size,
          fileStatus: 'failed',
          fileError: code,
          uploadProgress: null,
        });
        return;
      }
      void sendCriteriaFile(file);
    },
    [patchCriteria, sendCriteriaFile, state.criteria.serverUploaded],
  );

  const retryJdUpload = useCallback(() => {
    const file = state.jd.jdFile;
    if (file) void sendJdFile(file);
  }, [sendJdFile, state.jd.jdFile]);

  const retryCriteriaUpload = useCallback(() => {
    const file = state.criteria.criteriaFile;
    if (file) void sendCriteriaFile(file);
  }, [sendCriteriaFile, state.criteria.criteriaFile]);

  const downloadCampaignPdf = useCallback(
    async (fileType: CampaignFileType) => {
      const id = state.draftId ?? campaign?.id;
      if (!id) {
        setStepError(t('employer.campaigns.wizard.campaignNotFound'));
        return;
      }
      const lock = fileType === 'jd' ? jdDownloadLockRef : criteriaDownloadLockRef;
      if (lock.current) return;
      lock.current = true;
      const patch = fileType === 'jd' ? patchJd : patchCriteria;
      patch({ isDownloading: true, fileError: null });
      try {
        const result = await onDownloadFile(id, fileType);
        triggerBlobDownload(result, defaultCampaignDownloadName(fileType));
      } catch (error) {
        const status = getApiStatusCode(error);
        patch({
          fileError: status === 404 ? 'notFound' : 'server',
        });
        toast.error(t('employer.campaigns.files.errors.downloadFailed'));
      } finally {
        patch({ isDownloading: false });
        lock.current = false;
      }
    },
    [
      campaign?.id,
      onDownloadFile,
      patchCriteria,
      patchJd,
      setStepError,
      state.draftId,
      t,
    ],
  );

  return {
    selectJdFile,
    selectCriteriaFile,
    retryJdUpload,
    retryCriteriaUpload,
    downloadJdFile: () => void downloadCampaignPdf('jd'),
    downloadCriteriaFile: () => void downloadCampaignPdf('criteria'),
    ensureDraft,
    ensureDraftId,
    isJdBusy:
      state.jd.fileStatus === 'uploading' ||
      state.jd.fileStatus === 'replacing' ||
      state.jd.isDownloading,
    isCriteriaBusy:
      state.criteria.fileStatus === 'uploading' ||
      state.criteria.fileStatus === 'replacing' ||
      state.criteria.isDownloading,
    canReplaceFiles: isDraftEditable,
  };
}
