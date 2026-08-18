// @vitest-environment jsdom
import { createElement, StrictMode, type PropsWithChildren } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getQuestionSpeech = vi.fn();

vi.mock('../services/b2cPracticeSession.service', () => ({
  getQuestionSpeech: (...args: unknown[]) => getQuestionSpeech(...args),
}));

vi.mock('../utils/interviewerSpeechBus', () => ({
  attachSpeechAudio: vi.fn().mockResolvedValue(undefined),
  detachSpeechAudio: vi.fn(),
}));

const { useQuestionSpeech } = await import('./useQuestionSpeech');

const play = vi.fn<() => Promise<void>>();
const pause = vi.fn();
const revokeObjectURL = vi.fn();
const speak = vi.fn<(utterance: SpeechSynthesisUtterance) => void>();
const cancelBrowserSpeech = vi.fn();
const pauseBrowserSpeech = vi.fn();
const resumeBrowserSpeech = vi.fn();
let activeUtterance: SpeechSynthesisUtterance | null = null;

class FakeSpeechSynthesisUtterance {
  text: string;
  lang = '';
  onend: ((event: SpeechSynthesisEvent) => void) | null = null;
  onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

beforeEach(() => {
  getQuestionSpeech.mockReset();
  play.mockReset().mockResolvedValue(undefined);
  pause.mockReset();
  revokeObjectURL.mockReset();
  speak.mockReset().mockImplementation((utterance) => {
    activeUtterance = utterance;
  });
  cancelBrowserSpeech.mockReset();
  pauseBrowserSpeech.mockReset();
  resumeBrowserSpeech.mockReset();
  activeUtterance = null;
  // jsdom không cài đặt phát media, cũng không có object URL.
  HTMLMediaElement.prototype.play = play;
  HTMLMediaElement.prototype.pause = pause;
  Object.defineProperty(HTMLMediaElement.prototype, 'paused', {
    configurable: true,
    get: () => false,
  });
  URL.createObjectURL = vi.fn(() => 'blob:stub');
  URL.revokeObjectURL = revokeObjectURL;
  vi.stubGlobal('SpeechSynthesisUtterance', FakeSpeechSynthesisUtterance);
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      speak,
      cancel: cancelBrowserSpeech,
      pause: pauseBrowserSpeech,
      resume: resumeBrowserSpeech,
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useQuestionSpeech', () => {
  it('tải trước trong countdown nhưng chỉ phát khi gate mở', async () => {
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));

    const { rerender, result } = renderHook(
      ({ enabled }) => useQuestionSpeech('session-1', 'question-1', { enabled }),
      { initialProps: { enabled: false } },
    );

    await waitFor(() => expect(getQuestionSpeech).toHaveBeenCalledTimes(1));
    expect(play).not.toHaveBeenCalled();

    rerender({ enabled: true });
    expect(result.current.isBusy).toBe(true);
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
  });

  it('vẫn đọc câu đầu trong React StrictMode', async () => {
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));
    const wrapper = ({ children }: PropsWithChildren) =>
      createElement(StrictMode, null, children);

    renderHook(() => useQuestionSpeech('session-1', 'question-1'), { wrapper });

    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
  });

  it('tiếp tục tải giọng đọc khi phiên chuyển liên tiếp tới câu 4 và câu 5', async () => {
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));

    const { rerender } = renderHook(
      ({ questionId }) => useQuestionSpeech('session-1', questionId, { enabled: false }),
      { initialProps: { questionId: 'question-1' } },
    );

    for (let index = 1; index <= 5; index += 1) {
      await waitFor(() => expect(getQuestionSpeech).toHaveBeenCalledTimes(index));
      expect(getQuestionSpeech).toHaveBeenLastCalledWith(
        'session-1',
        `question-${index}`,
        expect.any(AbortSignal),
      );
      if (index < 5) rerender({ questionId: `question-${index + 1}` });
    }

    expect(play).not.toHaveBeenCalled();
  });

  it('hạ cấp về đọc chữ sau 9 giây tải TTS', async () => {
    vi.useFakeTimers();
    getQuestionSpeech.mockReturnValue(new Promise<Blob>(() => undefined));

    const { result } = renderHook(() => useQuestionSpeech('session-1', 'question-1'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(9_001);
    });

    expect(result.current.isLoadingSpeech).toBe(false);
    expect(result.current.isBusy).toBe(false);
    expect(result.current.needsManualPlay).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });

  it('dùng giọng trình duyệt cho câu 4–5 khi endpoint TTS bị lỗi', async () => {
    getQuestionSpeech.mockRejectedValue(new Error('tts-upstream-timeout'));

    const { result } = renderHook(() =>
      useQuestionSpeech('session-1', 'question-4', {
        text: 'Hãy mô tả cách bạn tối ưu hiệu năng giao diện.',
        language: 'vi',
      }),
    );

    await waitFor(() => expect(speak).toHaveBeenCalledTimes(1));
    expect(activeUtterance?.lang).toBe('vi-VN');
    expect(result.current.isBusy).toBe(true);
    expect(result.current.needsManualPlay).toBe(false);

    act(() => activeUtterance?.onend?.({} as SpeechSynthesisEvent));

    await waitFor(() => expect(result.current.isBusy).toBe(false));
    expect(result.current.needsManualPlay).toBe(false);
  });

  /** Nếu đổi câu/dừng giữa lúc tải, phản hồi cũ không được phát trên câu mới. */
  it('không phát khi phản hồi TTS về sau lúc đã dừng', async () => {
    let deliver: (blob: Blob) => void = () => {};
    getQuestionSpeech.mockReturnValue(
      new Promise<Blob>((resolve) => {
        deliver = resolve;
      }),
    );

    const { result } = renderHook(() => useQuestionSpeech('session-1', 'question-1'));
    await waitFor(() => expect(getQuestionSpeech).toHaveBeenCalledTimes(1));

    act(() => result.current.stopPlayback());

    await act(async () => {
      deliver(new Blob(['audio'], { type: 'audio/mpeg' }));
    });

    expect(play).not.toHaveBeenCalled();
    expect(result.current.isPlaying).toBe(false);
  });

  /** Đối chứng dương: không dừng thì đúng lượt đó phải phát. */
  it('vẫn phát bình thường khi không có ai dừng giữa chừng', async () => {
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));

    renderHook(() => useQuestionSpeech('session-1', 'question-1'));

    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));
  });

  /**
   * `ended` không bắn khi stream đứt giữa chừng hoặc tab bị throttle. Trước bản
   * vá, `isPlaying` kẹt `true` vĩnh viễn: avatar nhép miệng câm, thanh trạng
   * thái treo "AI đang nói", và không có nút nghe lại.
   */
  it('nhả trạng thái khi lượt phát kẹt không bao giờ kết thúc', async () => {
    vi.useFakeTimers();
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));

    const { result } = renderHook(() => useQuestionSpeech('session-1', 'question-1'));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(play).toHaveBeenCalledTimes(1);
    expect(result.current.isPlaying).toBe(true);

    // Không phát 'ended' — đúng như một stream chết giữa chừng.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000);
    });

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.needsManualPlay).toBe(true);
  });

  /**
   * Hạ cờ trạng thái là chưa đủ: element còn sống sẽ phát tiếp khi buffer hồi
   * phục, và lúc đó mic đã mở — tiếng đọc đề đi thẳng vào bài ghi. Dừng phải là
   * dừng thật, kèm trả object URL.
   */
  it('bịt miệng element và trả object URL khi dừng, không chỉ đổi cờ', async () => {
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));

    const { result } = renderHook(() => useQuestionSpeech('session-1', 'question-1'));
    await waitFor(() => expect(play).toHaveBeenCalledTimes(1));

    act(() => result.current.stopPlayback());

    expect(pause).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:stub');
  });

  /** Lượt phát kẹt cũng phải dừng element, không để nó nói tiếp lúc mic đã mở. */
  it('bịt miệng element cả khi lượt phát kẹt quá trần', async () => {
    vi.useFakeTimers();
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));

    renderHook(() => useQuestionSpeech('session-1', 'question-1'));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pause).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000);
    });

    expect(pause).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:stub');
  });

  it('giữ gate bận khi TTS bị pause do vi phạm', async () => {
    getQuestionSpeech.mockResolvedValue(new Blob(['audio'], { type: 'audio/mpeg' }));

    const { result } = renderHook(() => useQuestionSpeech('session-1', 'question-1'));
    await waitFor(() => expect(result.current.isPlaying).toBe(true));

    act(() => result.current.pausePlayback());

    expect(result.current.isPlaying).toBe(false);
    expect(result.current.isBusy).toBe(true);
  });
});
