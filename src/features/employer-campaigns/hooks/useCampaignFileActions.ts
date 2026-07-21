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
};

function mapFileUploadError(error: unknown): string {
  const status = getApiStatusCode(error);
  if (status === 404) return 'notFound';
  if (status === 409) return 'notDraft';
  if (status === 400) {
    const message = getApiErrorMessage(error, '').toLowerCase();
    if (message.includes('10') || message.includes('size') || message.includes('large')) {
      return 'tooLarge';
    }
    if (message.includes('pdf')) return 'notPdf';
    return 'server';
  }
  return 'server';
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
}: UseCampaignFileActionsArgs) {
  const draftIdRef = useRef<string | null>(state.draftId ?? campaign?.id ?? null);
  const draftEnsureRef = useRef<Promise<string> | null>(null);
  const jdLockRef = useRef(false);
  const criteriaLockRef = useRef(false);
  const jdDownloadLockRef = useRef(false);
  const criteriaDownloadLockRef = useRef(false);

  useEffect(() => {
    draftIdRef.current = state.draftId ?? campaign?.id ?? null;
  }, [campaign?.id, state.draftId]);

  const ensureDraftId = useCallback(async (): Promise<string> => {
    if (draftIdRef.current) return draftIdRef.current;

    if (!draftEnsureRef.current) {
      draftEnsureRef.current = (async () => {
        const infoError = validateCampaignWizardStep(state, 0, { mode: 'create' });
        if (infoError) throw new Error(infoError);

        const base = snapshot();
        const questions =
          base.questions.length > 0
            ? base.questions
            : [
                {
                  id: 'placeholder',
                  prompt: t('employer.campaigns.wizard.placeholderQuestion'),
                  skill: '',
                  difficulty: 'middle' as const,
                  source: 'manual' as const,
                  isRequired: true,
                },
              ];
        const created = await onCreateCampaign(
          buildCampaignCreateRequest({ ...base, questions }),
        );
        draftIdRef.current = created.id;
        setState((prev) => ({
          ...prev,
          draftId: created.id,
          lastSavedAt: created.updatedAt,
          autosaveStatus: 'saved',
        }));
        return created.id;
      })().finally(() => {
        draftEnsureRef.current = null;
      });
    }

    return draftEnsureRef.current;
  }, [onCreateCampaign, setState, snapshot, state, t]);

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
        uploadProgress: 10,
        inputMethod: 'file',
      });
      try {
        const id = await ensureDraftId();
        if (replace) {
          await onReplaceFiles(id, { jdFile: file });
          toast.success(t('employer.campaigns.files.replaceSuccess'));
        } else {
          await onUploadFiles(id, { jdFile: file });
          toast.success(t('employer.campaigns.files.uploadSuccess'));
        }
        patchJd({
          fileStatus: 'uploaded',
          fileError: null,
          uploadProgress: 100,
          serverUploaded: true,
        });
        setStepError(null);
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('employer.campaigns.')) {
          setStepError(t(error.message));
          setState((prev) => ({
            ...prev,
            currentStep: 0,
            errorSteps: Array.from(new Set([...prev.errorSteps, 0])),
          }));
        }
        patchJd({
          fileStatus: replace ? 'uploaded' : 'failed',
          fileError: mapFileUploadError(error),
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
      setState,
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
        const id = await ensureDraftId();
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
        if (error instanceof Error && error.message.startsWith('employer.campaigns.')) {
          setStepError(t(error.message));
          setState((prev) => ({
            ...prev,
            currentStep: 0,
            errorSteps: Array.from(new Set([...prev.errorSteps, 0])),
          }));
        }
        patchCriteria({
          fileStatus: replace ? 'uploaded' : 'failed',
          fileError: mapFileUploadError(error),
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
      setState,
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
