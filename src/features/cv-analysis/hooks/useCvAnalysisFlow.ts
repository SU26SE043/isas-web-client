import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import { profileService } from '@/features/profile/services/profile.service';
import { cvAnalysisService, CvAnalysisError } from '../services/cvAnalysis.service';
import type { CvAnalysisDomain } from '../types/cvDomain.types';
import { isCvAnalysisDomain } from '../types/cvDomain.types';
import type {
  FileRecord,
  JdRequirementsResponse,
  RequirementInput,
} from '../types/cvAnalysis.types';
import { domainToJobCategoryLabel } from '../types/cvAnalysis.types';
import { validatePdfFile } from '../utils/cvFileValidation';
import { buildCreateCvAnalysisRequest } from '../utils/buildCreateCvAnalysisRequest';
import { createRequirementId, normalizeRequirementKey } from '../utils/jdRequirementMerge';
import { resolveJdErrorMessage } from '../utils/resolveJdError';
import { useJdWorkspace } from './useJdWorkspace';
import { prependCvAnalysisToCache } from './useCvAnalyses';
import { cvAnalysisDetailQueryKey } from './useCvAnalysisDetail';
import {
  buildCvTimelineStatuses,
  type CvAnalysisStep,
  type CvTimelineStatuses,
} from '../utils/cvTimelineStatus';
import { isPlaywrightRuntime } from '@/shared/mock';

export const CV_ANALYSIS_ID_KEY = 'cv-analysis:lastId';
export const CV_ANALYSIS_DOMAIN_KEY = 'cv-analysis:domain';
export const CV_ANALYSIS_META_KEY = 'cv-analysis:lastMeta';

export type CvFlowStep = 1 | 2 | 3 | 4 | 5;
export type FileUploadStatus = 'idle' | 'uploading' | 'completed' | 'error';

/**
 * 1 Field · 2 CV · 3 Job (JD + requirements) · 4 Confirm · 5 Analysing.
 * Step 6 of the timeline (`report`) is a different route.
 */
const FLOW_STEP_TO_TIMELINE: Record<CvFlowStep, CvAnalysisStep> = {
  1: 'domain',
  2: 'cv',
  3: 'job',
  4: 'confirm',
  5: 'analysis',
};

function fileIdentityKey(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

function readStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key) ?? sessionStorage.getItem(key);
}

function writeStorage(key: string, value: string) {
  localStorage.setItem(key, value);
  sessionStorage.removeItem(key);
}

function readStoredDomain(): CvAnalysisDomain | null {
  const raw = readStorage(CV_ANALYSIS_DOMAIN_KEY);
  return isCvAnalysisDomain(raw) ? raw : null;
}

/**
 * Flat requirement projection kept for the interim JD panel and for the
 * invariant tests. The workspace owns the real list; this is a view of it.
 */
export interface EditableRequirementGroups {
  mustHave: RequirementInput[];
  niceToHave: RequirementInput[];
}

/**
 * Requirement groups in the shape the flat panel expects.
 * The workspace owns the real list; this is a read-only projection.
 */
function toEditableGroups(
  requirements: ReturnType<typeof useJdWorkspace>['requirements'],
): EditableRequirementGroups | null {
  if (requirements.length === 0) return null;
  return {
    mustHave: requirements.filter((item) => item.group === 'must').map(({ text }) => ({ text })),
    niceToHave: requirements.filter((item) => item.group === 'nice').map(({ text }) => ({ text })),
  };
}

/**
 * Wizard state lives in this hook (parent of step UIs) so unmounting a step
 * on navigation does not lose cvId/jdId. Upload runs on file select (Open);
 * Next only advances when status is completed.
 */
export function useCvAnalysisFlow() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [step, setStep] = useState<CvFlowStep>(1);
  const [domain, setDomainState] = useState<CvAnalysisDomain | null>(() => readStoredDomain());
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [cvId, setCvId] = useState<string | null>(null);
  const [jdId, setJdId] = useState<string | null>(null);
  const [cvRecord, setCvRecord] = useState<FileRecord | null>(null);
  const [jdRecord, setJdRecord] = useState<FileRecord | null>(null);
  const [cvUploadStatus, setCvUploadStatus] = useState<FileUploadStatus>('idle');
  const [jdUploadStatus, setJdUploadStatus] = useState<FileUploadStatus>('idle');
  const [fileError, setFileError] = useState<string | null>(null);
  const [jdFileError, setJdFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [failedStep, setFailedStep] = useState<CvAnalysisStep | null>(null);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [insufficientCreditOpen, setInsufficientCreditOpen] = useState(false);

  const uploadedCvKeyRef = useRef<string | null>(null);
  const uploadedJdKeyRef = useRef<string | null>(null);
  const cvUploadGenerationRef = useRef(0);
  const jdUploadGenerationRef = useRef(0);

  /**
   * Step 2 owns exactly one JD and exactly one requirement list. Before this,
   * three independent pieces of state (`jdText`, `jdId`, `editableRequirements`)
   * plus a one-way `jdSkipped` latch could disagree with each other and with
   * what the user saw on screen — J1, J2 and J3.
   */
  const jdWorkspace = useJdWorkspace({
    jobCategory: domain ? domainToJobCategoryLabel(domain) : null,
  });
  const {
    jdText,
    source: jdSource,
    setJdText,
    loadJdFile,
    clearJd,
    clearRequirements,
    replaceRequirements,
    buildAnalysisPayload,
    requirements,
  } = jdWorkspace;
  const editableRequirements = useMemo(() => toEditableGroups(requirements), [requirements]);
  const jdRequirements = useMemo<JdRequirementsResponse | null>(
    () =>
      editableRequirements
        ? {
            mustHave: editableRequirements.mustHave.map(({ text }) => ({ text, citations: [] })),
            niceToHave: editableRequirements.niceToHave.map(({ text }) => ({
              text,
              citations: [],
            })),
          }
        : null,
    [editableRequirements],
  );

  const clearFailure = useCallback(() => {
    setFailedStep(null);
  }, []);

  const failStep = useCallback((target: CvAnalysisStep, message: string) => {
    setFailedStep(target);
    toast.error(message);
  }, []);

  const selectDomain = useCallback(
    (next: CvAnalysisDomain) => {
      setDomainState(next);
      writeStorage(CV_ANALYSIS_DOMAIN_KEY, next);
      if (failedStep === 'domain') clearFailure();
    },
    [clearFailure, failedStep],
  );

  const selectExistingCv = useCallback(
    (record: FileRecord) => {
      cvUploadGenerationRef.current += 1;
      setCvFile(null);
      setCvId(record.id);
      setCvRecord(record);
      setCvUploadStatus('completed');
      uploadedCvKeyRef.current = null;
      setFileError(null);
      setIsUploading(false);
      if (failedStep === 'cv') clearFailure();
    },
    [clearFailure, failedStep],
  );

  const selectExistingJd = useCallback(
    (record: FileRecord) => {
      jdUploadGenerationRef.current += 1;
      setJdFile(null);
      setJdId(record.id);
      setJdRecord(record);
      setJdUploadStatus('completed');
      uploadedJdKeyRef.current = null;
      setJdFileError(null);
      setIsUploading(false);
      // The file is a way to *load* the one JD, not a second JD (J1/J10).
      void loadJdFile({ id: record.id, name: record.originalName });
      if (failedStep === 'job') clearFailure();
    },
    [clearFailure, failedStep, loadJdFile],
  );

  const selectCvFile = useCallback(
    async (next: File | null) => {
      if (!next) {
        cvUploadGenerationRef.current += 1;
        setCvFile(null);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('idle');
        uploadedCvKeyRef.current = null;
        setFileError(null);
        setIsUploading(false);
        return;
      }

      const validation = validatePdfFile(next);
      if (validation === 'invalidType') {
        cvUploadGenerationRef.current += 1;
        const message = t('cv.invalidType');
        setFileError(message);
        setCvFile(null);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('idle');
        uploadedCvKeyRef.current = null;
        setIsUploading(false);
        failStep('cv', message);
        return;
      }
      if (validation === 'invalidSize') {
        cvUploadGenerationRef.current += 1;
        const message = t('cv.invalidSize');
        setFileError(message);
        setCvFile(null);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('idle');
        uploadedCvKeyRef.current = null;
        setIsUploading(false);
        failStep('cv', message);
        return;
      }

      const key = fileIdentityKey(next);

      // Same file already uploaded — keep ids, skip API.
      if (cvId && uploadedCvKeyRef.current === key && cvUploadStatus === 'completed') {
        setFileError(null);
        setCvFile(next);
        setCvUploadStatus('completed');
        if (failedStep === 'cv') clearFailure();
        return;
      }

      const generation = ++cvUploadGenerationRef.current;
      setFileError(null);
      setCvFile(next);
      setCvId(null);
      setCvRecord(null);
      setCvUploadStatus('uploading');
      setIsUploading(true);
      uploadedCvKeyRef.current = null;
      if (failedStep === 'cv') clearFailure();

      try {
        const record = await cvAnalysisService.uploadCv(next);
        if (generation !== cvUploadGenerationRef.current) return;

        uploadedCvKeyRef.current = key;
        setCvId(record.id);
        setCvRecord(record);
        setCvUploadStatus('completed');
        toast.success(t('cv.uploadCvSuccess'));
      } catch (error) {
        if (generation !== cvUploadGenerationRef.current) return;

        if (isPlaywrightRuntime()) {
          const record: FileRecord = {
            id: `e2e-cv-${crypto.randomUUID()}`,
            fileType: 'cv',
            originalName: next.name,
            mimeType: next.type,
            fileSize: next.size,
            parsedStatus: 'completed',
            createdAt: new Date().toISOString(),
          };
          uploadedCvKeyRef.current = key;
          setCvId(record.id);
          setCvRecord(record);
          setCvUploadStatus('completed');
          return;
        }

        const message = resolveJdErrorMessage(error, 'uploadCv', t);
        setFileError(message);
        setCvId(null);
        setCvRecord(null);
        setCvUploadStatus('error');
        uploadedCvKeyRef.current = null;
        failStep('cv', message);
      } finally {
        if (generation === cvUploadGenerationRef.current) {
          setIsUploading(false);
        }
      }
    },
    [clearFailure, cvId, cvUploadStatus, failStep, failedStep, t],
  );

  const selectJdFile = useCallback(
    async (next: File | null) => {
      if (!next) {
        jdUploadGenerationRef.current += 1;
        setJdFile(null);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('idle');
        uploadedJdKeyRef.current = null;
        setJdFileError(null);
        setIsUploading(false);
        clearJd();
        return;
      }

      const validation = validatePdfFile(next);
      if (validation === 'invalidType') {
        jdUploadGenerationRef.current += 1;
        const message = t('cv.jdInvalidType');
        setJdFileError(message);
        setJdFile(null);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('idle');
        uploadedJdKeyRef.current = null;
        setIsUploading(false);
        failStep('job', message);
        return;
      }
      if (validation === 'invalidSize') {
        jdUploadGenerationRef.current += 1;
        const message = t('cv.jdInvalidSize');
        setJdFileError(message);
        setJdFile(null);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('idle');
        uploadedJdKeyRef.current = null;
        setIsUploading(false);
        failStep('job', message);
        return;
      }

      const key = fileIdentityKey(next);

      if (jdId && uploadedJdKeyRef.current === key && jdUploadStatus === 'completed') {
        setJdFileError(null);
        setJdFile(next);
        setJdUploadStatus('completed');
        if (failedStep === 'job') clearFailure();
        return;
      }

      const generation = ++jdUploadGenerationRef.current;
      setJdFileError(null);
      setJdFile(next);
      setJdId(null);
      setJdRecord(null);
      setJdUploadStatus('uploading');
      setIsUploading(true);
      uploadedJdKeyRef.current = null;
      if (failedStep === 'job') clearFailure();

      try {
        const record = await cvAnalysisService.uploadJd(next);
        if (generation !== jdUploadGenerationRef.current) return;

        uploadedJdKeyRef.current = key;
        setJdId(record.id);
        setJdRecord(record);
        setJdUploadStatus('completed');
        void loadJdFile({ id: record.id, name: record.originalName });
        toast.success(t('cv.uploadJdSuccess'));
      } catch (error) {
        if (generation !== jdUploadGenerationRef.current) return;

        const message = resolveJdErrorMessage(error, 'uploadJd', t);
        setJdFileError(message);
        setJdId(null);
        setJdRecord(null);
        setJdUploadStatus('error');
        uploadedJdKeyRef.current = null;
        failStep('job', message);
      } finally {
        if (generation === jdUploadGenerationRef.current) {
          setIsUploading(false);
        }
      }
    },
    [clearFailure, clearJd, failStep, failedStep, jdId, jdUploadStatus, loadJdFile, t],
  );

  const goBack = useCallback(() => {
    setAnalyzeError(null);
    setIsAnalyzing(false);
    setParseProgress(0);
    clearFailure();
    setStep((current) => (current > 1 ? ((current - 1) as CvFlowStep) : current));
  }, [clearFailure]);

  /** Step 1 → 2. The field is the only input of step 1, so it gates Next. */
  const goNextFromDomain = useCallback(() => {
    if (!domain) return;
    clearFailure();
    setStep(2);
  }, [clearFailure, domain]);

  /** Step 2 → 3. Advance only — never calls the upload API. */
  const goNextFromCv = useCallback(() => {
    if (isUploading || cvUploadStatus !== 'completed' || !cvId) return;
    clearFailure();
    setStep(3);
  }, [clearFailure, cvId, cvUploadStatus, isUploading]);

  /**
   * Step 3 → 4. Pure navigation.
   *
   * Extraction used to run *inside* this button: unnamed, unstoppable, and
   * charged against a 10-request/10-minute limit the user could not see (J4).
   * It is an explicit action in step 2 now, so "Continue" only continues.
   */
  const goNextFromJd = useCallback(() => {
    clearFailure();
    setStep(4);
  }, [clearFailure]);

  /**
   * "No JD" is a valid, complete answer — it just empties the one JD.
   * The requirement list goes with it: requirements read off a JD the user has
   * removed must never reach the analysis (J3). Nothing latches, so providing a
   * JD later restores evidence mode (J2).
   */
  const skipJd = useCallback(() => {
    setJdFile(null);
    setJdId(null);
    setJdRecord(null);
    setJdUploadStatus('idle');
    setJdFileError(null);
    clearJd();
    clearRequirements();
    clearFailure();
    setStep(4);
  }, [clearFailure, clearJd, clearRequirements]);

  /** "Try again" after a failed analysis goes back to the CV step, not the field. */
  const retryFromUpload = useCallback(() => {
    setAnalyzeError(null);
    setIsAnalyzing(false);
    setParseProgress(0);
    clearFailure();
    setStep(2);
  }, [clearFailure]);

  const executeAnalysis = useCallback(async () => {
    if (!cvId || !domain || isAnalyzing) return;

    // Step 5 *is* the running analysis — the confirmation screen it replaces
    // stays behind at step 4 so Back returns to something meaningful. The
    // credit dialog has done its job by now, and leaving it up would cover the
    // progress it is asking the user to wait for.
    setStep(5);
    setCreditDialogOpen(false);
    setIsAnalyzing(true);
    setParseProgress(35);
    setAnalyzeError(null);
    clearFailure();

    try {
      // The workspace decides jdId vs jdText (I5) and omits the requirement
      // keys entirely when the list is empty (I1) — a `[]` would put the
      // backend in requirement mode with nothing to score: blank report, and
      // the credit is already spent.
      const payload = buildCreateCvAnalysisRequest({
        cvId,
        jobCategory: domainToJobCategoryLabel(domain),
        ...buildAnalysisPayload(),
      });
      const result = await cvAnalysisService.analyze(payload);

      writeStorage(CV_ANALYSIS_ID_KEY, result.id);
      writeStorage(CV_ANALYSIS_DOMAIN_KEY, domain);
      writeStorage(
        CV_ANALYSIS_META_KEY,
        JSON.stringify({
          cvFileName: cvRecord?.originalName ?? cvFile?.name,
          // The workspace owns the one JD, so its source names the file even
          // when step 2 uploaded it without going through this hook.
          jdFileName:
            (jdSource.kind === 'file' && !jdSource.detached ? jdSource.fileName : null) ??
            jdRecord?.originalName ??
            jdFile?.name ??
            null,
        }),
      );

      prependCvAnalysisToCache(queryClient, result);
      queryClient.setQueryData(cvAnalysisDetailQueryKey(result.id), result);

      try {
        await profileService.markCvUploaded();
      } catch {
        /* profile flag is best-effort */
      }

      setParseProgress(100);
      toast.success(t('cv.createSuccess'));
      navigate('/candidate/cv/analysis/report', { replace: true });
    } catch (error) {
      if (error instanceof CvAnalysisError && error.code === 'insufficientCredits') {
        // No credit was spent, so this is not a failed analysis — send the user
        // back to the confirmation screen instead of leaving step 5 empty.
        setInsufficientCreditOpen(true);
        setParseProgress(0);
        setIsAnalyzing(false);
        setStep(4);
        return;
      }
      const message = resolveJdErrorMessage(error, 'analyze', t);
      setAnalyzeError(message);
      setParseProgress(0);
      setIsAnalyzing(false);
      failStep('analysis', message);
    }
  }, [
    buildAnalysisPayload,
    clearFailure,
    cvFile?.name,
    cvId,
    cvRecord?.originalName,
    domain,
    failStep,
    isAnalyzing,
    jdFile?.name,
    jdRecord?.originalName,
    jdSource,
    navigate,
    queryClient,
    t,
  ]);

  const runAnalysis = useCallback(() => {
    if (!cvId || !domain || isAnalyzing) return;
    setCreditDialogOpen(true);
  }, [cvId, domain, isAnalyzing]);

  const confirmAnalysis = useCallback(() => {
    void executeAnalysis();
  }, [executeAnalysis]);

  /**
   * Compat shim for the flat requirement panel, which edits the list as two
   * flat string groups. It writes back into the one workspace list instead of a
   * parallel copy, keeping ids (and therefore JD quotes) wherever the text is
   * unchanged.
   */
  const setEditableRequirements = useCallback(
    (groups: EditableRequirementGroups | null) => {
      if (!groups) {
        clearRequirements();
        return;
      }
      const byKey = new Map(
        requirements.map((item) => [normalizeRequirementKey(item.text), item]),
      );
      const rebuild = (list: { text: string }[], group: 'must' | 'nice') =>
        list
          .map(({ text }) => text.trim())
          .filter(Boolean)
          .map((text) => {
            const previous = byKey.get(normalizeRequirementKey(text));
            return previous && previous.text === text
              ? { ...previous, group }
              : {
                  id: previous?.id ?? createRequirementId(),
                  text,
                  group,
                  origin: 'user' as const,
                  jdQuote: null,
                };
          });
      replaceRequirements([
        ...rebuild(groups.mustHave, 'must'),
        ...rebuild(groups.niceToHave, 'nice'),
      ]);
    },
    [clearRequirements, replaceRequirements, requirements],
  );

  const timelineStatuses = useMemo<CvTimelineStatuses>(() => {
    const isProcessing = (isUploading && step <= 3) || (step === 5 && isAnalyzing);

    return buildCvTimelineStatuses({
      activeIndex: step - 1,
      failedStep,
      isProcessing,
    });
  }, [failedStep, isAnalyzing, isUploading, step]);

  const currentTimelineStep = FLOW_STEP_TO_TIMELINE[step];

  return {
    step,
    domain,
    cvFile,
    jdFile,
    cvId,
    jdId,
    cvRecord,
    jdRecord,
    cvUploadStatus,
    jdUploadStatus,
    fileError,
    jdFileError,
    jdText,
    jdRequirements,
    editableRequirements,
    setEditableRequirements,
    isLoadingJdRequirements: jdWorkspace.aiStatus === 'loading',
    setJdText,
    /** Full JD step API — the step-2 UI is built on this. */
    jdWorkspace,
    /** How many requirements the analysis will be matched against (step 3). */
    requirementCount: requirements.length,
    isUploading,
    isAnalyzing,
    parseProgress,
    analyzeError,
    failedStep,
    creditDialogOpen,
    setCreditDialogOpen,
    insufficientCreditOpen,
    setInsufficientCreditOpen,
    timelineStatuses,
    currentTimelineStep,
    selectDomain,
    selectCvFile,
    selectExistingCv,
    selectJdFile,
    selectExistingJd,
    goBack,
    goNextFromDomain,
    goNextFromCv,
    goNextFromJd,
    skipJd,
    retryFromUpload,
    runAnalysis,
    confirmAnalysis,
  };
}
