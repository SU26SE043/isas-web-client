// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SPEECH_ABSOLUTE_CAP_MS,
  SPEECH_UNKNOWN_DURATION_CAP_MS,
  SpeechPlaybackTimeoutError,
  speechWatchdogMs,
  waitForSpeechEnd,
} from './speechPlaybackWatchdog';

/**
 * Trước bản vá, lượt phát TTS chờ `ended`/`error` mà không có trần. Buffer đứt
 * giữa chừng hay tab bị throttle khi chạy nền thì không sự kiện nào bắn, Promise
 * không bao giờ settle, và cờ "AI đang nói" kẹt `true` tới hết buổi.
 */
function stubAudio(duration = Number.NaN) {
  const listeners = new Map<string, Set<() => void>>();
  return {
    duration,
    addEventListener(type: string, listener: () => void) {
      const set = listeners.get(type) ?? new Set<() => void>();
      set.add(listener);
      listeners.set(type, set);
    },
    removeEventListener(type: string, listener: () => void) {
      listeners.get(type)?.delete(listener);
    },
    emit(type: string) {
      listeners.get(type)?.forEach((listener) => listener());
    },
    listenerCount() {
      let total = 0;
      listeners.forEach((set) => {
        total += set.size;
      });
      return total;
    },
  };
}

/** Ghi lại kết cục mà không để rejection nào lọt ra ngoài. */
function track(promise: Promise<void>) {
  const outcome = vi.fn();
  const settled = promise.then(
    () => outcome('resolved'),
    (error: unknown) => outcome(error),
  );
  return { outcome, settled };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('speechWatchdogMs', () => {
  it('rơi về trần rộng khi duration chưa biết hoặc vô lý', () => {
    // NaN: chưa có metadata. Infinity: stream. <= 0: giá trị rác.
    expect(speechWatchdogMs(Number.NaN)).toBe(SPEECH_UNKNOWN_DURATION_CAP_MS);
    expect(speechWatchdogMs(Number.POSITIVE_INFINITY)).toBe(SPEECH_UNKNOWN_DURATION_CAP_MS);
    expect(speechWatchdogMs(0)).toBe(SPEECH_UNKNOWN_DURATION_CAP_MS);
    expect(speechWatchdogMs(-5)).toBe(SPEECH_UNKNOWN_DURATION_CAP_MS);
  });

  it('siết trần quanh độ dài thật khi đã biết duration', () => {
    // Clip 10s: 10 * 1.5 + 5 = 20s. Phát hiện kẹt sau 20s thay vì chờ đủ 60s.
    expect(speechWatchdogMs(10)).toBe(20_000);
    expect(speechWatchdogMs(10)).toBeLessThan(SPEECH_UNKNOWN_DURATION_CAP_MS);
  });

  it('không bao giờ vượt trần tuyệt đối, kể cả khi duration là số vô lý', () => {
    expect(speechWatchdogMs(10_000_000)).toBe(SPEECH_ABSOLUTE_CAP_MS);
  });
});

describe('waitForSpeechEnd', () => {
  it('resolve khi phát xong bình thường', async () => {
    const audio = stubAudio();
    const { outcome, settled } = track(waitForSpeechEnd(audio));

    audio.emit('ended');
    await settled;

    expect(outcome).toHaveBeenCalledWith('resolved');
  });

  it('reject khi audio báo lỗi', async () => {
    const audio = stubAudio();
    const { outcome, settled } = track(waitForSpeechEnd(audio));

    audio.emit('error');
    await settled;

    expect(outcome).toHaveBeenCalledWith(expect.any(Error));
    expect(outcome).not.toHaveBeenCalledWith(expect.any(SpeechPlaybackTimeoutError));
  });

  it('bắn timeout khi không sự kiện nào bắn — đúng đường kẹt vĩnh viễn cũ', async () => {
    vi.useFakeTimers();
    const audio = stubAudio();
    const { outcome, settled } = track(waitForSpeechEnd(audio));

    await vi.advanceTimersByTimeAsync(SPEECH_UNKNOWN_DURATION_CAP_MS - 1);
    expect(outcome).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2);
    await settled;

    expect(outcome).toHaveBeenCalledWith(expect.any(SpeechPlaybackTimeoutError));
  });

  it('phát hiện kẹt sớm hơn khi metadata cho biết clip ngắn', async () => {
    vi.useFakeTimers();
    const audio = stubAudio();
    const { outcome, settled } = track(waitForSpeechEnd(audio));

    audio.duration = 10;
    audio.emit('loadedmetadata');

    await vi.advanceTimersByTimeAsync(19_999);
    expect(outcome).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(2);
    await settled;

    expect(outcome).toHaveBeenCalledWith(expect.any(SpeechPlaybackTimeoutError));
  });

  it('không bắn timeout oan khi audio bị tạm dừng có chủ đích', async () => {
    vi.useFakeTimers();
    const audio = stubAudio();
    const { outcome } = track(waitForSpeechEnd(audio));

    audio.duration = 10; // trần 20s
    audio.emit('loadedmetadata');
    // Tạm dừng vì vi phạm: audio đứng yên là do ta, không phải stall.
    audio.emit('pause');

    await vi.advanceTimersByTimeAsync(60_000);
    expect(outcome).not.toHaveBeenCalled();

    // Phát lại thì trần ngắn có hiệu lực trở lại.
    audio.emit('play');
    await vi.advanceTimersByTimeAsync(20_001);
    expect(outcome).toHaveBeenCalledWith(expect.any(SpeechPlaybackTimeoutError));
  });

  it('gỡ hết listener sau khi settle', async () => {
    const audio = stubAudio();
    expect(audio.listenerCount()).toBe(0);

    const { settled } = track(waitForSpeechEnd(audio));
    expect(audio.listenerCount()).toBeGreaterThan(0);

    audio.emit('ended');
    await settled;

    expect(audio.listenerCount()).toBe(0);
  });

  it('chỉ settle một lần dù sự kiện tới sau timeout', async () => {
    vi.useFakeTimers();
    const audio = stubAudio();
    const { outcome, settled } = track(waitForSpeechEnd(audio));

    await vi.advanceTimersByTimeAsync(SPEECH_UNKNOWN_DURATION_CAP_MS + 1);
    await settled;
    audio.emit('ended');

    expect(outcome).toHaveBeenCalledTimes(1);
  });
});
