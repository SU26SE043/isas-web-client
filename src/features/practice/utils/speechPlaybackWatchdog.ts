/**
 * Trần thời gian cho một lượt phát TTS câu hỏi.
 *
 * `ended` KHÔNG phải lúc nào cũng bắn: buffer đứt giữa chừng, tab bị trình duyệt
 * throttle khi chạy nền, codec hiccup — mỗi ca đều để lại một Promise không bao
 * giờ settle. Mọi thứ đứng chờ nó (gỡ analyser, hạ cờ "AI đang nói", giải phóng
 * object URL, báo phát xong) sẽ kẹt vĩnh viễn, và avatar nhép miệng câm cho tới
 * hết buổi. Nên mọi đường thoát ở đây đều có trần.
 *
 * Trần khởi đầu rộng vì chưa biết câu hỏi dài bao nhiêu. Khi `loadedmetadata`
 * cho ra `duration` hợp lệ thì siết lại quanh độ dài thật — nhưng vẫn giữ một
 * trần tuyệt đối, vì `duration` rác (`Infinity` với stream, hoặc số vô lý) sẽ
 * đưa ta về đúng chỗ cũ: một timer không bao giờ nổ.
 */

/** Chưa biết clip dài bao nhiêu — chờ rộng tay. */
export const SPEECH_UNKNOWN_DURATION_CAP_MS = 60_000;
/** Chặn trên tuyệt đối, kể cả khi `duration` báo số vô lý. */
export const SPEECH_ABSOLUTE_CAP_MS = 60_000;
/** Clip 10s mà 20s chưa xong thì không phải "đọc chậm" nữa. */
export const SPEECH_DURATION_FACTOR = 1.5;
/** Bù cho lúc buffer và độ trễ khởi động. */
export const SPEECH_DURATION_MARGIN_MS = 5_000;

export class SpeechPlaybackTimeoutError extends Error {
  constructor() {
    super('speech-playback-timeout');
    this.name = 'SpeechPlaybackTimeoutError';
  }
}

/** Phần audio element mà watchdog thực sự cần — đủ hẹp để test dựng stub. */
export interface SpeechPlaybackTarget {
  readonly duration: number;
  addEventListener(type: string, listener: () => void): void;
  removeEventListener(type: string, listener: () => void): void;
}

/**
 * Bao lâu nữa thì coi là kẹt, tính theo `duration` đã biết (giây).
 * `duration` không hợp lệ (NaN khi chưa có metadata, `Infinity` với stream, số
 * âm) → rơi về trần rộng thay vì đoán bừa.
 */
export function speechWatchdogMs(
  durationSeconds: number,
  unknownCapMs: number = SPEECH_UNKNOWN_DURATION_CAP_MS,
): number {
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return unknownCapMs;
  return Math.min(
    SPEECH_ABSOLUTE_CAP_MS,
    durationSeconds * 1000 * SPEECH_DURATION_FACTOR + SPEECH_DURATION_MARGIN_MS,
  );
}

/**
 * Chờ một lượt phát kết thúc. Resolve khi `ended`; reject khi `error` hoặc khi
 * quá trần (`SpeechPlaybackTimeoutError`).
 *
 * Dừng CÓ CHỦ ĐÍCH (`pause`, ví dụ khi tạm dừng vì vi phạm) không phải là kẹt:
 * lúc đó nới trần ra thay vì bắn timeout oan. Audio bị stall thì `paused` vẫn là
 * `false` nên không đi qua nhánh này — đúng thứ ta muốn bắt.
 */
export function waitForSpeechEnd(
  audio: SpeechPlaybackTarget,
  unknownCapMs: number = SPEECH_UNKNOWN_DURATION_CAP_MS,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let settled = false;

    const clearTimer = () => {
      if (timer !== null) clearTimeout(timer);
      timer = null;
    };

    const cleanup = () => {
      clearTimer();
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('loadedmetadata', onMetadata);
      audio.removeEventListener('durationchange', onMetadata);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('play', onPlay);
      signal?.removeEventListener('abort', onAbort);
    };

    const settle = (finish: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      finish();
    };

    const arm = (ms: number) => {
      clearTimer();
      timer = setTimeout(() => settle(() => reject(new SpeechPlaybackTimeoutError())), ms);
    };

    function onEnded() {
      settle(resolve);
    }

    function onError() {
      settle(() => reject(new Error('audio-playback-error')));
    }

    function onMetadata() {
      if (settled) return;
      arm(speechWatchdogMs(audio.duration, unknownCapMs));
    }

    function onPause() {
      if (settled) return;
      // Pause do violation là có chủ đích và có thể kéo dài; chỉ đếm lại trần
      // khi audio thực sự resume, nếu không một popup mở lâu sẽ bị hiểu nhầm là stall.
      clearTimer();
    }

    function onPlay() {
      onMetadata();
    }

    function onAbort() {
      settle(() => reject(new DOMException('Speech playback aborted', 'AbortError')));
    }

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('loadedmetadata', onMetadata);
    audio.addEventListener('durationchange', onMetadata);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('play', onPlay);
    signal?.addEventListener('abort', onAbort, { once: true });

    if (signal?.aborted) {
      onAbort();
      return;
    }

    // Metadata có thể đã sẵn sàng trước khi ta kịp lắng nghe (blob từ cache),
    // lúc đó `loadedmetadata` không bắn nữa — nên tự tính một lần ngay đây.
    onMetadata();
  });
}
