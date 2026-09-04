/* @vitest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import toast from 'react-hot-toast';
import { useCampaignFileActions } from './useCampaignFileActions';
import type { CampaignWizardPersistedState } from '../types/campaignWizard.types';

vi.mock('react-hot-toast', () => ({ default: { success: vi.fn(), error: vi.fn() } }));

const patchJd = vi.fn();
const patchCriteria = vi.fn();
const setState = vi.fn();
const setStepError = vi.fn();
const onUploadFiles = vi.fn();
const onReplaceFiles = vi.fn();

function createState(overrides: Record<string, unknown> = {}) {
  return {
    info: {
      title: 'Frontend interview',
      domain: 'Frontend',
      maxCandidates: 10,
      timeLimitMinutes: 30,
      passScorePct: null,
      startsAt: '2099-01-01T09:00',
      expiresAt: '2099-01-02T09:00',
      timezone: 'Asia/Ho_Chi_Minh',
    },
    jd: {
      inputMethod: 'file',
      jdFile: null,
      fileName: null,
      fileSize: null,
      jdText: '',
      fileStatus: 'idle',
      fileError: null,
      uploadProgress: null,
      serverUploaded: false,
      isDownloading: false,
    },
    hardFilters: {
      requiredSkills: [],
      keywordsAny: [],
      minYearsExperience: null,
      requiredSkillsTouched: false,
      keywordsAnyTouched: false,
      minYearsExperienceTouched: false,
    },
    criteria: {
      criteriaFile: null,
      fileName: null,
      fileSize: null,
      fileStatus: 'idle',
      fileError: null,
      uploadProgress: null,
      serverUploaded: false,
      isDownloading: false,
    },
    rubric: [],
    questions: [],
    questionCount: 5,
    settings: {
      antiCheatEnabled: true,
      faceVerifyEnabled: false,
      adaptiveEnabled: false,
      maxFollowUps: 2,
      maxQuestions: 5,
    },
    currentStep: 1,
    completedSteps: [],
    errorSteps: [],
    autosaveStatus: 'idle',
    draftId: 'draft-1',
    ...overrides,
  } as unknown as CampaignWizardPersistedState;
}

function renderActions(state = createState()) {
  return renderHook(() =>
    useCampaignFileActions({
      state,
      campaign: null,
      isDraftEditable: true,
      t: (key) => key,
      setState,
      patchJd,
      patchCriteria,
      setStepError,
      onCreateCampaign: vi.fn(),
      onUploadFiles,
      onReplaceFiles,
      onDownloadFile: vi.fn(),
      snapshot: () => ({ ...state, questions: [] }) as never,
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  onUploadFiles.mockResolvedValue({ id: 'draft-1', jobDescription: 'Server JD' });
  onReplaceFiles.mockResolvedValue({ id: 'draft-1', jobDescription: 'Replaced JD' });
});

describe('useCampaignFileActions — JD persistence guard', () => {
  it('does not report success when the upload response omits jdFileUrl', async () => {
    const { result } = renderActions();
    const file = new File(['%PDF-1.4'], 'jd.pdf', { type: 'application/pdf' });

    act(() => result.current.selectJdFile(file));
    await waitFor(() => expect(patchJd).toHaveBeenCalledWith(expect.objectContaining({ fileStatus: 'failed' })));

    expect(toast.success).not.toHaveBeenCalled();
    expect(patchJd).not.toHaveBeenCalledWith(expect.objectContaining({ serverUploaded: true }));
  });

  it('reports success and marks serverUploaded only when jdFileUrl is returned', async () => {
    onUploadFiles.mockResolvedValue({ id: 'draft-1', jdFileUrl: '/files/jd.pdf', jobDescription: 'Server JD' });
    const { result } = renderActions();
    const file = new File(['%PDF-1.4'], 'jd.pdf', { type: 'application/pdf' });

    act(() => result.current.selectJdFile(file));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('employer.campaigns.files.uploadSuccess'));

    expect(patchJd).toHaveBeenCalledWith(expect.objectContaining({ serverUploaded: true, uploadProgress: 100 }));
  });

  it('rejects a non-PDF before calling the upload API', async () => {
    const { result } = renderActions();
    const file = new File(['text'], 'jd.txt', { type: 'text/plain' });

    act(() => result.current.selectJdFile(file));
    await waitFor(() => expect(patchJd).toHaveBeenCalledWith(expect.objectContaining({ fileError: 'notPdf' })));
    expect(onUploadFiles).not.toHaveBeenCalled();
  });

  it('rejects an empty PDF before calling the upload API', async () => {
    const { result } = renderActions();

    act(() => result.current.selectJdFile(new File([], 'empty.pdf', { type: 'application/pdf' })));
    await waitFor(() => expect(patchJd).toHaveBeenCalledWith(expect.objectContaining({ fileError: 'corrupt' })));
    expect(onUploadFiles).not.toHaveBeenCalled();
  });

  it('uses replace API when the JD was already persisted', async () => {
    onReplaceFiles.mockResolvedValue({ id: 'draft-1', jdFileUrl: '/new.pdf', jobDescription: 'New JD' });
    const { result } = renderActions(createState({ jd: { ...createState().jd, serverUploaded: true, fileStatus: 'uploaded' } }));

    act(() => result.current.selectJdFile(new File(['%PDF'], 'new.pdf', { type: 'application/pdf' })));
    await waitFor(() => expect(onReplaceFiles).toHaveBeenCalledWith('draft-1', { jdFile: expect.any(File) }));
    expect(onUploadFiles).not.toHaveBeenCalled();
  });

  it('does not clear a persisted JD when selecting null', () => {
    const { result } = renderActions(createState({ jd: { ...createState().jd, serverUploaded: true } }));

    act(() => result.current.selectJdFile(null));
    expect(patchJd).not.toHaveBeenCalled();
  });

  it('clears an unpersisted JD when selecting null', () => {
    const { result } = renderActions();

    act(() => result.current.selectJdFile(null));
    expect(patchJd).toHaveBeenCalledWith(expect.objectContaining({ serverUploaded: false, fileStatus: 'idle' }));
  });

  it('serializes repeated JD selections while an upload is in flight', async () => {
    let resolveUpload!: (value: unknown) => void;
    onUploadFiles.mockReturnValue(new Promise((resolve) => { resolveUpload = resolve; }));
    const { result } = renderActions();

    act(() => result.current.selectJdFile(new File(['%PDF'], 'jd.pdf', { type: 'application/pdf' })));
    await waitFor(() => expect(onUploadFiles).toHaveBeenCalledTimes(1));
    act(() => result.current.selectJdFile(new File(['%PDF'], 'second.pdf', { type: 'application/pdf' })));
    expect(onUploadFiles).toHaveBeenCalledTimes(1);
    resolveUpload({ id: 'draft-1', jdFileUrl: '/jd.pdf', jobDescription: 'JD' });
    await waitFor(() => expect(toast.success).toHaveBeenCalledTimes(1));
  });
});
