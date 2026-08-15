import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/shared/languages';
import { readSpeechAmplitude } from '../../utils/interviewerSpeechBus';
import type { InterviewerSceneHandle } from './interviewerScene';

const MODEL_URL = '/avatar/interviewer.glb';

interface InterviewerAvatarProps {
  /** True khi AI đang đọc câu hỏi — dùng để nhép miệng. */
  speaking: boolean;
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

/**
 * Biên độ nhép miệng giả lập cho các đường không đi qua Web Audio (dữ liệu mock,
 * hoặc trình duyệt chặn AudioContext). Trộn ba sóng lệch tần cho đỡ máy móc.
 */
function simulateAmplitude(nowMs: number): number {
  const t = nowMs / 1000;
  const wave = Math.sin(t * 9.1) * 0.5 + Math.sin(t * 5.3) * 0.3 + Math.sin(t * 13.7) * 0.2;
  return Math.max(0, Math.min(1, 0.45 + wave * 0.4));
}

export function InterviewerAvatar({ speaking }: InterviewerAvatarProps) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speakingRef = useRef(speaking);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!supportsWebGL()) {
      setStatus('error');
      return;
    }

    let handle: InterviewerSceneHandle | null = null;
    let cancelled = false;

    const getAmplitude = () => {
      if (!speakingRef.current) return 0;
      const measured = readSpeechAmplitude();
      return measured === null ? simulateAmplitude(performance.now()) : measured;
    };

    // three + model 6,5 MB chỉ tải khi thực sự vào phòng phỏng vấn.
    void import('./interviewerScene')
      .then(({ createInterviewerScene }) =>
        createInterviewerScene({
          canvas,
          modelUrl: MODEL_URL,
          getAmplitude,
          onReady: () => {
            if (!cancelled) setStatus('ready');
          },
        }))
      .then((scene) => {
        if (cancelled) scene.dispose();
        else handle = scene;
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
      handle?.dispose();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(120,132,150,0.28),transparent_62%)]"
        aria-hidden
      />
      <canvas
        ref={canvasRef}
        className="relative size-full"
        aria-label={t('practice.avatar.label')}
        role="img"
        style={{ opacity: status === 'ready' ? 1 : 0, transition: 'opacity 500ms ease' }}
      />
      {status === 'loading' ? (
        <div className="absolute inset-0 grid place-items-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" aria-hidden />
          <span className="text-xs">{t('practice.avatar.loading')}</span>
        </div>
      ) : null}
      {status === 'error' ? (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <p className="text-xs text-muted-foreground">{t('practice.avatar.unavailable')}</p>
        </div>
      ) : null}
    </div>
  );
}
