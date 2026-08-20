// @vitest-environment jsdom
import { createElement, type PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';

const mocks = vi.hoisted(() => ({
  uploadCv: vi.fn(),
  uploadJd: vi.fn(),
  readParsedText: vi.fn(),
  getJdRequirements: vi.fn(),
  analyze: vi.fn(),
  markCvUploaded: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('../services/cvAnalysis.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/cvAnalysis.service')>();
  return {
    ...actual,
    cvAnalysisService: {
      ...actual.cvAnalysisService,
      uploadCv: mocks.uploadCv,
      uploadJd: mocks.uploadJd,
      readParsedText: mocks.readParsedText,
      getJdRequirements: mocks.getJdRequirements,
      analyze: mocks.analyze,
    },
  };
});

vi.mock('@/features/profile/services/profile.service', () => ({
  profileService: { markCvUploaded: mocks.markCvUploaded },
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

const { useCvAnalysisFlow } = await import('./useCvAnalysisFlow');

const JD_BODY = 'Chúng tôi cần lập trình viên React có kinh nghiệm với TypeScript. '.repeat(6);

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(
    QueryClientProvider,
    { client: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
    createElement(MemoryRouter, null, createElement(LanguageProvider, null, children)),
  );

function fileRecord(id: string, name: string, fileType: 'cv' | 'jd') {
  return {
    id,
    fileType,
    originalName: name,
    mimeType: 'application/pdf',
    fileSize: 1024,
    parsedStatus: 'completed',
    createdAt: '2026-08-19T00:00:00Z',
  };
}

function pdf(name: string) {
  return new File([new Uint8Array([1, 2, 3])], name, { type: 'application/pdf' });
}

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.markCvUploaded.mockResolvedValue(undefined);
  mocks.readParsedText.mockResolvedValue({ status: 'completed', parsedText: JD_BODY });
  mocks.analyze.mockResolvedValue({
    id: 'analysis-1',
    cvId: 'cv-1',
    jdId: null,
    jobCategory: 'FE',
    summary: '',
    strengths: [],
    weaknesses: [],
    suggestions: [],
    jdMatch: null,
    requirementSummary: null,
    mustHaveMatches: [],
    niceToHaveMatches: [],
    cvSections: [],
    citations: [],
    createdAt: '2026-08-19T00:00:00Z',
  });
  localStorage.clear();
});

async function withCv(view: ReturnType<typeof renderHook<ReturnType<typeof useCvAnalysisFlow>, unknown>>) {
  act(() => view.result.current.selectDomain('frontend'));
  act(() => view.result.current.selectExistingCv(fileRecord('cv-1', 'cv.pdf', 'cv')));
}

describe('useCvAnalysisFlow — JD step', () => {
  it('J1 — an uploaded JD file is used, not swallowed by leftover pasted text', async () => {
    const view = renderHook(() => useCvAnalysisFlow(), { wrapper });
    await withCv(view);

    act(() => view.result.current.setJdText('JD cũ đã dán từ trước'));
    mocks.uploadJd.mockResolvedValue(fileRecord('jd-1', 'jd.pdf', 'jd'));
    await act(async () => {
      await view.result.current.selectJdFile(pdf('jd.pdf'));
    });

    await act(async () => {
      view.result.current.confirmAnalysis();
    });

    const payload = mocks.analyze.mock.calls[0][0];
    expect(payload.jdId).toBe('jd-1');
    expect(payload.jdText).toBeUndefined();
    // The textarea now shows the file content, so the screen and the request agree.
    expect(view.result.current.jdText).toBe(JD_BODY);
  });

  it('J3 — skipping the JD also drops the requirements read from it', async () => {
    const view = renderHook(() => useCvAnalysisFlow(), { wrapper });
    await withCv(view);

    mocks.getJdRequirements.mockResolvedValue({
      mustHave: [{ text: 'Thành thạo React', citations: [], jdQuote: null }],
      niceToHave: [],
    });
    act(() => view.result.current.setJdText(JD_BODY));
    await act(async () => {
      await view.result.current.jdWorkspace.requestAiSuggestions();
    });
    expect(view.result.current.editableRequirements?.mustHave).toHaveLength(1);

    act(() => view.result.current.skipJd());

    expect(view.result.current.editableRequirements).toBeNull();
    expect(view.result.current.jdRequirements).toBeNull();

    await act(async () => {
      view.result.current.confirmAnalysis();
    });
    const payload = mocks.analyze.mock.calls[0][0];
    expect('mustHave' in payload).toBe(false);
    expect('niceToHave' in payload).toBe(false);
    expect(payload.jdText).toBeUndefined();
    expect(payload.jdId).toBeUndefined();
  });

  it('J2 — skipping once does not disable requirement extraction for the session', async () => {
    const view = renderHook(() => useCvAnalysisFlow(), { wrapper });
    await withCv(view);

    act(() => view.result.current.skipJd());

    mocks.getJdRequirements.mockResolvedValue({
      mustHave: [{ text: 'Thành thạo React', citations: [], jdQuote: null }],
      niceToHave: [{ text: 'Biết Docker', citations: [], jdQuote: null }],
    });
    act(() => view.result.current.setJdText(JD_BODY));
    await act(async () => {
      await view.result.current.jdWorkspace.requestAiSuggestions();
    });

    expect(mocks.getJdRequirements).toHaveBeenCalledTimes(1);
    expect(view.result.current.editableRequirements).toEqual({
      mustHave: [{ text: 'Thành thạo React' }],
      niceToHave: [{ text: 'Biết Docker' }],
    });

    await act(async () => {
      view.result.current.confirmAnalysis();
    });
    const payload = mocks.analyze.mock.calls[0][0];
    expect(payload.mustHave).toEqual([{ text: 'Thành thạo React' }]);
    expect(payload.jdText).toBe(JD_BODY.trim());
  });

  it('J8 — going back and forward again does not spend another rate-limit slot', async () => {
    const view = renderHook(() => useCvAnalysisFlow(), { wrapper });
    await withCv(view);

    mocks.getJdRequirements.mockResolvedValue({
      mustHave: [{ text: 'Thành thạo React', citations: [], jdQuote: null }],
      niceToHave: [],
    });
    act(() => view.result.current.setJdText(JD_BODY));
    await act(async () => {
      await view.result.current.jdWorkspace.requestAiSuggestions();
    });
    act(() => view.result.current.goNextFromJd());
    act(() => view.result.current.goBack());
    await act(async () => {
      await view.result.current.jdWorkspace.requestAiSuggestions();
    });

    expect(mocks.getJdRequirements).toHaveBeenCalledTimes(1);
    expect(view.result.current.editableRequirements?.mustHave).toHaveLength(1);
  });

  it('J4/J7 — a failed extraction shows contextual copy and still advances', async () => {
    const view = renderHook(() => useCvAnalysisFlow(), { wrapper });
    await withCv(view);

    const { CvAnalysisError } = await import('../services/cvAnalysis.service');
    mocks.getJdRequirements.mockRejectedValue(
      new CvAnalysisError('notFound', 'Request failed with status code 404', 404),
    );
    act(() => view.result.current.setJdText(JD_BODY));
    await act(async () => {
      await view.result.current.jdWorkspace.requestAiSuggestions();
    });
    act(() => view.result.current.goNextFromJd());

    // Step 4 is the confirmation screen; step 5 is the running analysis.
    expect(view.result.current.step).toBe(4);
    expect(view.result.current.failedStep).toBeNull();
  });

  it('I1 — no requirements means the request omits both requirement keys', async () => {
    const view = renderHook(() => useCvAnalysisFlow(), { wrapper });
    await withCv(view);

    act(() => view.result.current.setJdText(JD_BODY));
    mocks.getJdRequirements.mockResolvedValue({ mustHave: [], niceToHave: [] });
    await act(async () => {
      await view.result.current.jdWorkspace.requestAiSuggestions();
    });
    act(() => view.result.current.goNextFromJd());

    await act(async () => {
      view.result.current.confirmAnalysis();
    });

    const payload = mocks.analyze.mock.calls[0][0];
    expect('mustHave' in payload).toBe(false);
    expect('niceToHave' in payload).toBe(false);
    expect(payload.jdText).toBe(JD_BODY.trim());
  });
});
