import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useLanguage } from '@/shared/languages';
import {
  getRubric,
  getRubricErrorStatus,
  isRubricValidationError,
  resetRubric,
  updateRubric,
} from '../services/candidateRubrics.service';
import type { EditableRubricCriterion, JobCategory } from '../types/rubric.types';
import {
  createEmptyCriterion,
  getInitialJobCategory,
  mapEditableToUpdateRequest,
  mapResponseToEditable,
  serializeCriteria,
} from '../utils/rubricMapper';
import {
  computeTotalMaxScore,
  computeTotalWeightDecimal,
  formatWeightPercentFromDecimal,
  getMaxScoreStatus,
  getWeightStatus,
  validateRubric,
} from '../utils/rubricValidation';

export const CANDIDATE_RUBRIC_QUERY_KEY = ['candidate', 'rubric'] as const;

export function useCandidateRubric() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [jobCategory, setJobCategory] = useState<JobCategory>(() => getInitialJobCategory());
  const [criteria, setCriteria] = useState<EditableRubricCriterion[]>([]);
  const [isCustom, setIsCustom] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingCategory, setPendingCategory] = useState<JobCategory | null>(null);
  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const savedSnapshotRef = useRef('');
  const focusClientIdRef = useRef<string | null>(null);

  const rubricQuery = useQuery({
    queryKey: [...CANDIDATE_RUBRIC_QUERY_KEY, jobCategory],
    queryFn: () => getRubric(jobCategory),
  });

  useEffect(() => {
    if (!rubricQuery.data) return;
    const editable = mapResponseToEditable(rubricQuery.data);
    setCriteria(editable);
    setIsCustom(rubricQuery.data.isCustom);
    savedSnapshotRef.current = serializeCriteria(editable);
    setIsDirty(false);
    setSaveError(null);
  }, [rubricQuery.data]);

  const totalWeight = useMemo(() => computeTotalWeightDecimal(criteria), [criteria]);
  const totalMaxScore = useMemo(() => computeTotalMaxScore(criteria), [criteria]);
  const weightStatus = useMemo(() => getWeightStatus(totalWeight), [totalWeight]);
  const maxScoreStatus = useMemo(() => getMaxScoreStatus(totalMaxScore), [totalMaxScore]);
  const validationCode = useMemo(() => validateRubric(criteria), [criteria]);
  const totalWeightLabel = useMemo(() => formatWeightPercentFromDecimal(totalWeight), [totalWeight]);

  const markDirty = useCallback((next: EditableRubricCriterion[]) => {
    setCriteria(next);
    setIsDirty(serializeCriteria(next) !== savedSnapshotRef.current);
    setSaveError(null);
  }, []);

  const updateCriterion = useCallback(
    (clientId: string, patch: Partial<EditableRubricCriterion>) => {
      markDirty(criteria.map((item) => (item.clientId === clientId ? { ...item, ...patch } : item)));
    },
    [criteria, markDirty],
  );

  const removeCriterion = useCallback(
    (clientId: string) => {
      markDirty(criteria.filter((item) => item.clientId !== clientId));
    },
    [criteria, markDirty],
  );

  const addCriterion = useCallback(() => {
    const created = createEmptyCriterion();
    focusClientIdRef.current = created.clientId;
    markDirty([...criteria, created]);
  }, [criteria, markDirty]);

  const saveMutation = useMutation({
    mutationFn: () => updateRubric(jobCategory, mapEditableToUpdateRequest(criteria)),
    onSuccess: (response) => {
      const editable = mapResponseToEditable(response);
      setCriteria(editable);
      setIsCustom(response.isCustom);
      savedSnapshotRef.current = serializeCriteria(editable);
      setIsDirty(false);
      setSaveError(null);
      void queryClient.setQueryData([...CANDIDATE_RUBRIC_QUERY_KEY, jobCategory], response);
      toast.success(t('rubrics.toast.saved').replace('{domain}', t(`rubrics.domain.${jobCategory}`)));
    },
    onError: (error) => {
      const status = getRubricErrorStatus(error);
      setSaveError(
        isRubricValidationError(status) ? t('rubrics.error.saveValidation') : t('rubrics.error.saveGeneric'),
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetRubric(jobCategory),
    onSuccess: async () => {
      setResetDialogOpen(false);
      const response = await queryClient.fetchQuery({
        queryKey: [...CANDIDATE_RUBRIC_QUERY_KEY, jobCategory],
        queryFn: () => getRubric(jobCategory),
      });
      const editable = mapResponseToEditable(response);
      setCriteria(editable);
      setIsCustom(response.isCustom);
      savedSnapshotRef.current = serializeCriteria(editable);
      setIsDirty(false);
      setSaveError(null);
      toast.success(t('rubrics.toast.reset'));
    },
    onError: () => {
      toast.error(t('rubrics.error.resetGeneric'));
    },
  });

  const requestCategoryChange = useCallback(
    (next: JobCategory) => {
      if (next === jobCategory) return;
      if (isDirty) {
        setPendingCategory(next);
        setUnsavedDialogOpen(true);
        return;
      }
      setJobCategory(next);
    },
    [isDirty, jobCategory],
  );

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  const confirmDiscardChanges = useCallback(() => {
    setUnsavedDialogOpen(false);
    if (pendingCategory) {
      setJobCategory(pendingCategory);
      setPendingCategory(null);
      setIsDirty(false);
      return;
    }
    const editable = rubricQuery.data ? mapResponseToEditable(rubricQuery.data) : [];
    setCriteria(editable);
    savedSnapshotRef.current = serializeCriteria(editable);
    setIsDirty(false);
    setSaveError(null);
  }, [pendingCategory, rubricQuery.data]);

  const cancelUnsavedDialog = useCallback(() => {
    setUnsavedDialogOpen(false);
    setPendingCategory(null);
  }, []);

  const canSave = isDirty && validationCode === null && !saveMutation.isPending;

  return {
    jobCategory,
    criteria,
    isCustom,
    isDirty,
    isLoading: rubricQuery.isLoading,
    isFetching: rubricQuery.isFetching,
    isError: rubricQuery.isError,
    refetch: rubricQuery.refetch,
    totalWeight,
    totalWeightLabel,
    totalMaxScore,
    weightStatus,
    maxScoreStatus,
    validationCode,
    saveError,
    unsavedDialogOpen,
    resetDialogOpen,
    setResetDialogOpen,
    focusClientIdRef,
    requestCategoryChange,
    updateCriterion,
    removeCriterion,
    addCriterion,
    save: () => saveMutation.mutate(),
    isSaving: saveMutation.isPending,
    canSave,
    reset: () => resetMutation.mutate(),
    isResetting: resetMutation.isPending,
    confirmDiscardChanges,
    cancelUnsavedDialog,
  };
}
