/**
 * Cầu nối giữa audio TTS của câu hỏi và avatar 3D người phỏng vấn.
 *
 * Avatar cần biên độ âm thanh theo từng frame để nhép miệng. Thay vì kéo
 * `HTMLAudioElement` xuyên qua nhiều tầng component, hook phát TTS đăng ký
 * element vào bus này, còn avatar chỉ đọc một con số.
 *
 * An toàn là ưu tiên số một: khi `createMediaElementSource` được gọi, tiếng của
 * element **chỉ** còn đi qua Web Audio graph. Nếu AudioContext bị suspend thì
 * ứng viên sẽ không nghe thấy gì. Nên bus chỉ gắn analyser khi context đã chắc
 * chắn `running`, và mọi lỗi đều rơi về "không phân tích" chứ không bao giờ làm
 * mất tiếng.
 */

type AudioContextCtor = typeof AudioContext;

let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let sourceNode: MediaElementAudioSourceNode | null = null;
let attachedAudio: HTMLAudioElement | null = null;
let timeDomain: Uint8Array<ArrayBuffer> | null = null;

/** Một element chỉ được `createMediaElementSource` đúng một lần trong đời. */
const routedElements = new WeakSet<HTMLAudioElement>();

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

async function ensureRunningContext(): Promise<AudioContext | null> {
  const Ctor = getAudioContextCtor();
  if (!Ctor) return null;
  try {
    audioContext ??= new Ctor();
    if (audioContext.state === 'suspended') await audioContext.resume();
    return audioContext.state === 'running' ? audioContext : null;
  } catch {
    return null;
  }
}

/**
 * Gắn analyser vào audio đang phát. Gọi **sau** khi `audio.play()` resolve —
 * lúc đó chắc chắn đã có user activation nên `resume()` sẽ thành công.
 */
export async function attachSpeechAudio(audio: HTMLAudioElement): Promise<void> {
  if (attachedAudio === audio) return;
  detachSpeechAudio();
  const context = await ensureRunningContext();
  if (!context) return;
  // Element đã từng bị route ở lần phát trước: dựng lại source sẽ ném lỗi và
  // làm mất tiếng, nên bỏ qua lip-sync cho element đó.
  if (routedElements.has(audio)) return;
  try {
    const node = context.createMediaElementSource(audio);
    routedElements.add(audio);
    const nextAnalyser = context.createAnalyser();
    nextAnalyser.fftSize = 1024;
    nextAnalyser.smoothingTimeConstant = 0.55;
    node.connect(nextAnalyser);
    // Vẫn phải nối thẳng ra loa: analyser không tự đẩy tiếng đi tiếp.
    node.connect(context.destination);
    sourceNode = node;
    analyser = nextAnalyser;
    attachedAudio = audio;
    timeDomain = new Uint8Array(new ArrayBuffer(nextAnalyser.fftSize));
  } catch {
    detachSpeechAudio();
  }
}

/** Ngắt analyser. Không đụng tới đường ra loa của element. */
export function detachSpeechAudio(): void {
  try {
    analyser?.disconnect();
  } catch {
    /* node có thể đã bị context đóng */
  }
  analyser = null;
  sourceNode = null;
  attachedAudio = null;
  timeDomain = null;
}

/**
 * Biên độ giọng nói hiện tại trong khoảng 0..1, hoặc `null` khi không có
 * analyser (avatar sẽ tự nhép giả lập).
 */
export function readSpeechAmplitude(): number | null {
  if (!analyser || !timeDomain) return null;
  if (attachedAudio?.paused) return 0;
  analyser.getByteTimeDomainData(timeDomain);
  let sum = 0;
  for (let i = 0; i < timeDomain.length; i += 1) {
    const centered = (timeDomain[i] - 128) / 128;
    sum += centered * centered;
  }
  const rms = Math.sqrt(sum / timeDomain.length);
  // Giọng TTS thường có RMS ~0.05–0.25; khuếch đại để miệng mở tự nhiên.
  return Math.min(1, rms * 4.5);
}

/** Đang có analyser hoạt động hay không (dùng cho test và debug). */
export function hasSpeechAnalyser(): boolean {
  return Boolean(sourceNode && analyser);
}
