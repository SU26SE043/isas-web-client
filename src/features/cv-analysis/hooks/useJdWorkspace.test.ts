// @vitest-environment jsdom
import { createElement, type PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/shared/languages';

const mocks = vi.hoisted(() => ({
  getJdRequirements: vi.fn(),
  readParsedText: vi.fn(),
}));

vi.mock('../services/cvAnalysis.service', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/cvAnalysis.service')>();
  return {
    ...actual,
    cvAnalysisService: {
      ...actual.cvAnalysisService,
      getJdRequirements: mocks.getJdRequirements,
      readParsedText: mocks.readParsedText,
    },
  };
});

const { CvAnalysisError } = await import('../services/cvAnalysis.service');
const { useJdWorkspace, JD_MIN_CHARS_FOR_AI, JD_DRIFT_DEBOUNCE_MS, isJdChanged } = await import(
  './useJdWorkspace'
);
const { buildCreateCvAnalysisRequest } = await import('../utils/buildCreateCvAnalysisRequest');

const wrapper = ({ children }: PropsWithChildren) =>
  createElement(LanguageProvider, null, children);

const LONG_JD = 'Chúng tôi cần lập trình viên React có kinh nghiệm xây dựng sản phẩm. '.repeat(6);

function suggestions(
  mustHave: string[],
  niceToHave: string[] = [],
  quote: string | null = 'JD line',
) {
  return {
    mustHave: mustHave.map((text) => ({ text, citations: [], jdQuote: quote })),
    niceToHave: niceToHave.map((text) => ({ text, citations: [], jdQuote: quote })),
  };
}

function setup(jobCategory: string | null = 'FE') {
  return renderHook(() => useJdWorkspace({ jobCategory }), { wrapper });
}

async function pasteAndExtract(
  view: ReturnType<typeof setup>,
  response = suggestions(['Thành thạo React'], ['Biết Docker']),
) {
  mocks.getJdRequirements.mockResolvedValueOnce(response);
  act(() => view.result.current.setJdText(LONG_JD));
  await act(async () => {
    await view.result.current.requestAiSuggestions();
  });
}

beforeEach(() => {
  mocks.getJdRequirements.mockReset();
  mocks.readParsedText.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('I1 — zero requirements must omit mustHave and niceToHave', () => {
  it('emits neither key when the list is empty', () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));

    const payload = view.result.current.buildAnalysisPayload();

    expect('mustHave' in payload).toBe(false);
    expect('niceToHave' in payload).toBe(false);
    expect(payload).toEqual({ jdText: LONG_JD.trim() });
  });

  it('keeps both keys omitted through buildCreateCvAnalysisRequest', () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));

    const request = buildCreateCvAnalysisRequest({
      cvId: 'cv-1',
      jobCategory: 'FE',
      ...view.result.current.buildAnalysisPayload(),
    });

    expect('mustHave' in request).toBe(false);
    expect('niceToHave' in request).toBe(false);
  });

  it('emits both groups as soon as one requirement exists', () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      view.result.current.addRequirement('Thành thạo React', 'must');
    });

    const payload = view.result.current.buildAnalysisPayload();

    expect(payload.mustHave).toEqual([{ text: 'Thành thạo React' }]);
    expect(payload.niceToHave).toEqual([]);
  });

  it('drops every requirement when the user clears the list', () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      view.result.current.addRequirement('Thành thạo React', 'must');
    });
    act(() => view.result.current.clearRequirements());

    expect('mustHave' in view.result.current.buildAnalysisPayload()).toBe(false);
  });
});

describe('I2 — requirements always travel with the JD they belong to', () => {
  it('sends the pasted JD next to the requirements', async () => {
    const view = setup();
    await pasteAndExtract(view);

    const payload = view.result.current.buildAnalysisPayload();

    expect(payload.jdText).toBe(LONG_JD.trim());
    expect(payload.mustHave).toEqual([{ text: 'Thành thạo React' }]);
  });

  it('sends the file id next to the requirements when the file is untouched', async () => {
    mocks.readParsedText.mockResolvedValue({ status: 'completed', parsedText: LONG_JD });
    const view = setup();
    await act(async () => {
      await view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' });
    });
    act(() => {
      view.result.current.addRequirement('Thành thạo React', 'must');
    });

    const payload = view.result.current.buildAnalysisPayload();

    expect(payload.jdId).toBe('jd-1');
    expect(payload.jdText).toBeUndefined();
    expect(payload.mustHave).toHaveLength(1);
  });

  it('never sends jdId and jdText together (J1 — the file can no longer be swallowed)', async () => {
    mocks.readParsedText.mockResolvedValue({ status: 'completed', parsedText: LONG_JD });
    const view = setup();
    await act(async () => {
      await view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' });
    });

    const attached = view.result.current.buildAnalysisPayload();
    expect(Boolean(attached.jdId) && Boolean(attached.jdText)).toBe(false);

    act(() => view.result.current.setJdText(`${LONG_JD} thêm dòng mới`));
    const edited = view.result.current.buildAnalysisPayload();
    expect(Boolean(edited.jdId) && Boolean(edited.jdText)).toBe(false);
  });

  it('keeps the requirements the user typed when the JD is cleared, and shows exactly what is sent', () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      view.result.current.addRequirement('Thành thạo React', 'must');
    });
    act(() => view.result.current.clearJd());

    const payload = view.result.current.buildAnalysisPayload();

    expect(payload.jdText).toBeUndefined();
    expect(payload.jdId).toBeUndefined();
    // The list on screen and the payload are the same list — nothing hidden
    // survives the JD being removed (J3).
    expect(payload.mustHave).toEqual([{ text: 'Thành thạo React' }]);
    expect(view.result.current.requirements).toHaveLength(1);
  });
});

describe('I3 — 20 items and 500 characters are enforced in the client', () => {
  it('refuses the 21st requirement', () => {
    const view = setup();
    act(() => {
      for (let index = 0; index < 20; index += 1) {
        view.result.current.addRequirement(`Yêu cầu số ${index}`, 'must');
      }
    });

    let result: ReturnType<typeof view.result.current.addRequirement> | null = null;
    act(() => {
      result = view.result.current.addRequirement('Yêu cầu thừa', 'must');
    });

    expect(view.result.current.requirementCount).toBe(20);
    expect(view.result.current.isAtRequirementLimit).toBe(true);
    expect(result).toMatchObject({ ok: false, reason: 'limit' });
  });

  it('refuses a requirement over 500 characters', () => {
    const view = setup();
    let result: ReturnType<typeof view.result.current.addRequirement> | null = null;
    act(() => {
      result = view.result.current.addRequirement('a'.repeat(501), 'must');
    });

    expect(result).toMatchObject({ ok: false, reason: 'tooLong' });
    expect(view.result.current.requirementCount).toBe(0);
  });

  it('caps an AI merge at 20 and reports what was left out', async () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      for (let index = 0; index < 18; index += 1) {
        view.result.current.addRequirement(`Yêu cầu số ${index}`, 'must');
      }
    });

    mocks.getJdRequirements.mockResolvedValueOnce(
      suggestions(['Gợi ý A', 'Gợi ý B', 'Gợi ý C'], ['Gợi ý D']),
    );
    await act(async () => {
      await view.result.current.requestAiSuggestions();
    });

    expect(view.result.current.requirementCount).toBe(20);
    expect(view.result.current.lastMerge).toMatchObject({
      addedCount: 2,
      skippedOverLimitCount: 2,
    });
    expect(
      view.result.current.buildAnalysisPayload().mustHave!.length +
        view.result.current.buildAnalysisPayload().niceToHave!.length,
    ).toBe(20);
  });
});

describe('I4 — an edited suggestion becomes the user’s row for good', () => {
  it('flips origin to user and drops the stale quote', async () => {
    const view = setup();
    await pasteAndExtract(view);
    const aiItem = view.result.current.requirements[0];
    expect(aiItem.origin).toBe('ai');
    expect(aiItem.jdQuote).toBe('JD line');

    act(() => {
      view.result.current.updateRequirementText(aiItem.id, 'Thành thạo React và Redux');
    });

    const edited = view.result.current.requirements[0];
    expect(edited.origin).toBe('user');
    expect(edited.jdQuote).toBeNull();
    expect(edited.text).toBe('Thành thạo React và Redux');
  });

  it('survives a re-extraction that drops untouched AI rows', async () => {
    const view = setup();
    await pasteAndExtract(view, suggestions(['Thành thạo React'], ['Biết Docker']));
    const [aiMust, aiNice] = view.result.current.requirements;

    act(() => {
      view.result.current.updateRequirementText(aiMust.id, 'Thành thạo React 18');
    });
    act(() => {
      view.result.current.addRequirement('Giao tiếp tiếng Anh', 'nice');
    });

    mocks.getJdRequirements.mockResolvedValueOnce(suggestions(['Kinh nghiệm Kubernetes']));
    act(() => view.result.current.setJdText(`${LONG_JD} Yêu cầu mới hoàn toàn khác.`));
    await act(async () => {
      await view.result.current.refreshFromChangedJd();
    });

    const texts = view.result.current.requirements.map((item) => item.text);
    expect(texts).toContain('Thành thạo React 18');
    expect(texts).toContain('Giao tiếp tiếng Anh');
    expect(texts).toContain('Kinh nghiệm Kubernetes');
    expect(texts).not.toContain(aiNice.text);
  });

  it('treats a group change as ownership but keeps the JD quote', async () => {
    const view = setup();
    await pasteAndExtract(view);
    const aiItem = view.result.current.requirements[0];

    act(() => {
      view.result.current.moveRequirement(aiItem.id, 'nice');
    });

    const moved = view.result.current.requirements[0];
    expect(moved.group).toBe('nice');
    expect(moved.origin).toBe('user');
    expect(moved.jdQuote).toBe('JD line');
  });
});

describe('I5 — a detached file sends jdText, never jdId', () => {
  it('switches to jdText the moment the user edits the loaded text', async () => {
    mocks.readParsedText.mockResolvedValue({ status: 'completed', parsedText: LONG_JD });
    const view = setup();
    await act(async () => {
      await view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' });
    });

    expect(view.result.current.source).toEqual({
      kind: 'file',
      fileId: 'jd-1',
      fileName: 'jd.pdf',
      detached: false,
    });
    expect(view.result.current.buildAnalysisPayload()).toMatchObject({ jdId: 'jd-1' });

    act(() => view.result.current.setJdText(`${LONG_JD} Bổ sung yêu cầu.`));

    expect(view.result.current.source).toMatchObject({ detached: true });
    const payload = view.result.current.buildAnalysisPayload();
    expect(payload.jdId).toBeUndefined();
    expect(payload.jdText).toBe(`${LONG_JD} Bổ sung yêu cầu.`.trim());
  });

  it('re-attaches when the text is restored to the file content', async () => {
    mocks.readParsedText.mockResolvedValue({ status: 'completed', parsedText: LONG_JD });
    const view = setup();
    await act(async () => {
      await view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' });
    });

    act(() => view.result.current.setJdText('khác'));
    act(() => view.result.current.setJdText(LONG_JD));

    expect(view.result.current.source).toMatchObject({ detached: false });
    expect(view.result.current.buildAnalysisPayload()).toMatchObject({ jdId: 'jd-1' });
  });

  it('detachJdFile forces jdText even without an edit', async () => {
    mocks.readParsedText.mockResolvedValue({ status: 'completed', parsedText: LONG_JD });
    const view = setup();
    await act(async () => {
      await view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' });
    });
    act(() => view.result.current.detachJdFile());

    const payload = view.result.current.buildAnalysisPayload();
    expect(payload.jdId).toBeUndefined();
    expect(payload.jdText).toBe(LONG_JD.trim());
  });
});

describe('I6 — client dedupe is at least as strict as the backend', () => {
  it('refuses a manual duplicate that the backend would silently drop', () => {
    const view = setup();
    act(() => {
      view.result.current.addRequirement('Kỹ năng React', 'must');
    });

    let result: ReturnType<typeof view.result.current.addRequirement> | null = null;
    act(() => {
      result = view.result.current.addRequirement('  KỸ NĂNG   REACT.  ', 'nice');
    });

    expect(result).toMatchObject({ ok: false, reason: 'duplicate' });
    expect(view.result.current.requirementCount).toBe(1);
  });

  it('drops AI suggestions the backend would collapse', async () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      view.result.current.addRequirement('Kỹ năng React', 'must');
    });

    mocks.getJdRequirements.mockResolvedValueOnce(
      suggestions(['ky nang react', 'Kinh nghiệm Docker']),
    );
    await act(async () => {
      await view.result.current.requestAiSuggestions();
    });

    expect(view.result.current.requirementCount).toBe(2);
    expect(view.result.current.lastMerge).toMatchObject({
      addedCount: 1,
      skippedDuplicateCount: 1,
    });
  });

  it('the payload count equals the count on screen', async () => {
    const view = setup();
    await pasteAndExtract(view, suggestions(['A requirement', 'Another requirement'], ['Nice one']));

    const payload = view.result.current.buildAnalysisPayload();
    expect(payload.mustHave!.length + payload.niceToHave!.length).toBe(
      view.result.current.requirementCount,
    );
  });
});

describe('AI extraction', () => {
  it('J8 — an unchanged JD never spends a rate-limit slot', async () => {
    const view = setup();
    await pasteAndExtract(view);
    expect(mocks.getJdRequirements).toHaveBeenCalledTimes(1);

    let outcome: Awaited<ReturnType<typeof view.result.current.requestAiSuggestions>> | null = null;
    await act(async () => {
      outcome = await view.result.current.requestAiSuggestions();
    });

    expect(outcome).toEqual({ status: 'cached' });
    expect(mocks.getJdRequirements).toHaveBeenCalledTimes(1);
  });

  it('calls again once the JD changed', async () => {
    const view = setup();
    await pasteAndExtract(view);

    mocks.getJdRequirements.mockResolvedValueOnce(suggestions(['Yêu cầu khác']));
    act(() => view.result.current.setJdText(`${LONG_JD} Một đoạn hoàn toàn mới cho JD này.`));
    await act(async () => {
      await view.result.current.requestAiSuggestions();
    });

    expect(mocks.getJdRequirements).toHaveBeenCalledTimes(2);
  });

  it('is blocked before any call when the JD is too short (J16)', async () => {
    const view = setup();
    act(() => view.result.current.setJdText('JD ngắn'));

    let outcome: Awaited<ReturnType<typeof view.result.current.requestAiSuggestions>> | null = null;
    await act(async () => {
      outcome = await view.result.current.requestAiSuggestions();
    });

    expect(outcome).toMatchObject({ status: 'blocked', reason: 'jdTooShort' });
    expect(view.result.current.isJdTooShortForAi).toBe(true);
    expect(view.result.current.canRequestAi).toBe(false);
    expect(mocks.getJdRequirements).not.toHaveBeenCalled();
    expect('JD ngắn'.length).toBeLessThan(JD_MIN_CHARS_FOR_AI);
  });

  it('is blocked without a JD or a job category', async () => {
    const noJd = setup();
    await act(async () => {
      await expect(noJd.result.current.requestAiSuggestions()).resolves.toMatchObject({
        reason: 'noJd',
      });
    });

    const noCategory = setup(null);
    act(() => noCategory.result.current.setJdText(LONG_JD));
    await act(async () => {
      await expect(noCategory.result.current.requestAiSuggestions()).resolves.toMatchObject({
        reason: 'noJobCategory',
      });
    });
    expect(mocks.getJdRequirements).not.toHaveBeenCalled();
  });

  it('aborts on cancel and leaves the list untouched', async () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      view.result.current.addRequirement('Yêu cầu của tôi', 'must');
    });

    mocks.getJdRequirements.mockImplementation(
      (_input: unknown, options: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new CvAnalysisError('canceled', 'Request canceled.')),
          );
        }),
    );

    let pending: Promise<unknown> | null = null;
    act(() => {
      pending = view.result.current.requestAiSuggestions();
    });
    await waitFor(() => expect(view.result.current.aiStatus).toBe('loading'));

    act(() => view.result.current.cancelAiRequest());
    await act(async () => {
      await expect(pending).resolves.toEqual({ status: 'canceled' });
    });

    expect(view.result.current.aiStatus).toBe('idle');
    expect(view.result.current.requirements.map((item) => item.text)).toEqual(['Yêu cầu của tôi']);
  });

  it('surfaces a rate limit with its countdown and keeps existing requirements', async () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      view.result.current.addRequirement('Yêu cầu của tôi', 'must');
    });

    mocks.getJdRequirements.mockRejectedValueOnce(
      new CvAnalysisError('rateLimited', 'Request failed with status code 429', 429, {
        retryAfterSeconds: 45,
      }),
    );
    await act(async () => {
      await view.result.current.requestAiSuggestions();
    });

    expect(view.result.current.aiStatus).toBe('error');
    expect(view.result.current.aiRetryAfterSeconds).toBe(45);
    expect(view.result.current.aiError?.message).not.toMatch(/Request failed/);
    expect(view.result.current.requirementCount).toBe(1);
  });

  it('reports an empty extraction without touching the list', async () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));

    mocks.getJdRequirements.mockResolvedValueOnce(suggestions([], []));
    let outcome: Awaited<ReturnType<typeof view.result.current.requestAiSuggestions>> | null = null;
    await act(async () => {
      outcome = await view.result.current.requestAiSuggestions();
    });

    expect(outcome).toEqual({ status: 'empty' });
    expect(view.result.current.aiStatus).toBe('empty');
    expect(view.result.current.requirementCount).toBe(0);
  });
});

describe('undo', () => {
  it('undoes a merge without touching the rows the user owns', async () => {
    const view = setup();
    act(() => view.result.current.setJdText(LONG_JD));
    act(() => {
      view.result.current.addRequirement('Yêu cầu của tôi', 'must');
    });
    mocks.getJdRequirements.mockResolvedValueOnce(suggestions(['Gợi ý A'], ['Gợi ý B']));
    await act(async () => {
      await view.result.current.requestAiSuggestions();
    });
    expect(view.result.current.requirementCount).toBe(3);

    act(() => {
      view.result.current.undoLastMerge();
    });

    expect(view.result.current.requirements.map((item) => item.text)).toEqual(['Yêu cầu của tôi']);
    expect(view.result.current.canUndoMerge).toBe(false);
  });

  it('restores a removed requirement at its original position', () => {
    const view = setup();
    act(() => {
      view.result.current.addRequirement('Một', 'must');
      view.result.current.addRequirement('Hai', 'must');
      view.result.current.addRequirement('Ba', 'must');
    });
    const middle = view.result.current.requirements[1];

    act(() => {
      view.result.current.removeRequirement(middle.id);
    });
    expect(view.result.current.requirements.map((item) => item.text)).toEqual(['Một', 'Ba']);
    expect(view.result.current.canUndoRemove).toBe(true);

    act(() => {
      view.result.current.undoRemove();
    });
    expect(view.result.current.requirements.map((item) => item.text)).toEqual([
      'Một',
      'Hai',
      'Ba',
    ]);
  });
});

describe('JD drift after suggestions exist', () => {
  it('raises the banner only after the debounce, and only for a real change', async () => {
    const view = setup();
    await pasteAndExtract(view);
    expect(view.result.current.isJdChangedSinceAi).toBe(false);

    vi.useFakeTimers();
    act(() => view.result.current.setJdText(`${LONG_JD}x`));
    act(() => {
      vi.advanceTimersByTime(JD_DRIFT_DEBOUNCE_MS + 10);
    });
    expect(view.result.current.isJdChangedSinceAi).toBe(false);

    act(() => view.result.current.setJdText('Một mô tả công việc hoàn toàn khác. '.repeat(12)));
    act(() => {
      vi.advanceTimersByTime(JD_DRIFT_DEBOUNCE_MS + 10);
    });
    expect(view.result.current.isJdChangedSinceAi).toBe(true);

    act(() => view.result.current.keepRequirementsAfterJdChange());
    expect(view.result.current.isJdChangedSinceAi).toBe(false);
  });

  it('detects drift by ratio and by length delta', () => {
    const base = 'a'.repeat(1000);
    expect(isJdChanged(base, base)).toBe(false);
    expect(isJdChanged(base, `${base.slice(0, 990)}bbbbbbbbbb`)).toBe(false);
    expect(isJdChanged(base, base + 'b'.repeat(201))).toBe(true);
    expect(isJdChanged('React developer', 'Business analyst wanted')).toBe(true);
  });
});

describe('JD file loading', () => {
  it('reports the pending parse state instead of failing (202)', async () => {
    mocks.readParsedText.mockResolvedValue({ status: 'pending' });
    const view = setup();

    await act(async () => {
      await expect(view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' })).resolves.toBe(
        'pending',
      );
    });

    expect(view.result.current.fileLoadStatus).toBe('pending');
    expect(view.result.current.jdText).toBe('');
  });

  it('reports a failed parse with translated copy (409)', async () => {
    mocks.readParsedText.mockResolvedValue({ status: 'failed' });
    const view = setup();

    await act(async () => {
      await view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' });
    });

    expect(view.result.current.fileLoadStatus).toBe('failed');
    expect(view.result.current.fileLoadError).toMatch(/Không đọc được nội dung tệp JD/);
  });

  it('never leaks a raw axios message when the load fails (P1)', async () => {
    mocks.readParsedText.mockRejectedValue(
      new CvAnalysisError('notFound', 'Request failed with status code 404', 404),
    );
    const view = setup();

    await act(async () => {
      await view.result.current.loadJdFile({ id: 'jd-1', name: 'jd.pdf' });
    });

    expect(view.result.current.fileLoadError).not.toMatch(/Request failed/);
    expect(view.result.current.fileLoadError).toMatch(/tệp JD/i);
  });
});
