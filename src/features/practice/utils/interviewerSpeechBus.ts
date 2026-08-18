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
interface SpeechGraph {
  source: MediaElementAudioSourceNode;
  analyser: AnalyserNode;
  timeDomain: Uint8Array<ArrayBuffer>;
}

const routedElements = new WeakMap<HTMLAudioElement, SpeechGraph>();

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
 * Mở Web Audio ngay trong user gesture của nút "Bắt đầu". Trình duyệt web
 * không có tương đương `setMediaPlaybackRequiresUserGesture(false)` của
 * Android WebView, nên context phải được resume trước khi chuyển trang/chờ TTS.
 */
export async function resumeSpeechAudioContext(): Promise<boolean> {
  return Boolean(await ensureRunningContext());
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
  const existing = routedElements.get(audio);
  if (existing) {
    sourceNode = existing.source;
    analyser = existing.analyser;
    attachedAudio = audio;
    timeDomain = existing.timeDomain;
    return;
  }
  try {
    const node = context.createMediaElementSource(audio);
    const nextAnalyser = context.createAnalyser();
    nextAnalyser.fftSize = 1024;
    nextAnalyser.smoothingTimeConstant = 0.55;
    node.connect(nextAnalyser);
    // Analyser nằm nối tiếp trên đường ra loa; nếu không nối destination thì
    // element bị route qua Web Audio sẽ câm hoàn toàn.
    nextAnalyser.connect(context.destination);
    const nextTimeDomain = new Uint8Array(new ArrayBuffer(nextAnalyser.fftSize));
    routedElements.set(audio, {
      source: node,
      analyser: nextAnalyser,
      timeDomain: nextTimeDomain,
    });
    sourceNode = node;
    analyser = nextAnalyser;
    attachedAudio = audio;
    timeDomain = nextTimeDomain;
  } catch {
    detachSpeechAudio();
  }
}

/** Ngắt analyser. Không đụng tới đường ra loa của element. */
export function detachSpeechAudio(): void {
  // Không disconnect graph: một HTMLMediaElement chỉ được tạo source đúng một
  // lần. Giữ graph để lượt phát kế tiếp trên cùng player dùng lại được; việc
  // xoá các ref active khiến biên độ lập tức về `null`/miệng về trạng thái nghỉ.
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
