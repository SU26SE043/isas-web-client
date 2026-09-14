import { useEffect, useRef, useState } from 'react';
import { Download, Pause, Play } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAnswerAudio } from '../../../hooks/useCampaignResults';

// Một player phát tại một thời điểm: player nào bấm phát thì bắn event này, các player khác tự dừng.
const PLAY_EVENT = 'isas-result-audio-play';

const RATES = [1, 1.5, 2] as const;

// Đuôi file tải theo MIME thật (Interview trả theo định dạng ứng viên đã thu) — không ghi cứng .webm.
export function audioExtension(mimeType: string | null | undefined): string {
  const type = (mimeType ?? '').split(';')[0].trim().toLowerCase();
  if (type === 'audio/mp4' || type === 'video/mp4') return 'm4a';
  if (type === 'audio/mpeg') return 'mp3';
  if (type === 'audio/wav' || type === 'audio/x-wav') return 'wav';
  if (type === 'audio/ogg') return 'ogg';
  if (type === 'audio/flac') return 'flac';
  return 'webm';
}

function formatClock(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
}

export function AnswerAudioPlayer({
  campaignId,
  sessionId,
  answerId,
}: {
  campaignId: string;
  sessionId: string;
  answerId: string;
}) {
  const { t } = useLanguage();
  // Fetch LƯỜI: blob chỉ được tải khi bấm phát lần đầu (12 câu không tải 12 file lúc mở trang).
  const { state, objectUrl, mimeType, load } = useAnswerAudio(campaignId, sessionId, answerId);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [pendingPlay, setPendingPlay] = useState(false);
  const [rate, setRate] = useState<number>(1);

  useEffect(() => {
    const pauseIfOther = (event: Event) => {
      if (event.target !== audioRef.current) {
        audioRef.current?.pause();
        setPlaying(false);
      }
    };
    window.addEventListener(PLAY_EVENT, pauseIfOther);
    return () => window.removeEventListener(PLAY_EVENT, pauseIfOther);
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, objectUrl]);

  // Bấm phát khi chưa có blob → chờ load xong rồi mới play (không tự phát nếu người dùng không bấm).
  useEffect(() => {
    if (!objectUrl || !pendingPlay || !audioRef.current) return;
    setPendingPlay(false);
    window.dispatchEvent(new Event(PLAY_EVENT));
    void audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [objectUrl, pendingPlay]);

  if (state === 'error') {
    return <p className="mt-3 text-sm text-destructive">{t('employer.campaigns.results.detail.audioError')}</p>;
  }

  const toggle = async () => {
    if (!objectUrl) {
      setPendingPlay(true);
      await load();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      window.dispatchEvent(new Event(PLAY_EVENT));
      await audio.play();
      setPlaying(true);
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => void toggle()} disabled={state === 'loading'}>
        {state === 'loading' ? <Spinner className="size-4" /> : playing ? <Pause aria-hidden /> : <Play aria-hidden />}
        {playing ? t('employer.campaigns.results.detail.pause') : t('employer.campaigns.results.detail.play')}
      </Button>
      <audio
        ref={audioRef}
        src={objectUrl ?? undefined}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
      />
      <input
        aria-label={t('employer.campaigns.results.detail.audioProgress')}
        className="min-w-[140px] flex-1 accent-foreground"
        type="range"
        min="0"
        max={Number.isFinite(duration) ? duration : 0}
        step="0.1"
        value={currentTime}
        onChange={(event) => {
          if (audioRef.current) audioRef.current.currentTime = Number(event.target.value);
        }}
        disabled={!objectUrl}
      />
      <span className="text-xs tabular-nums text-muted-foreground">
        {formatClock(currentTime)} / {formatClock(duration)}
      </span>
      <select
        aria-label={t('employer.campaigns.results.detail.playbackRate')}
        value={rate}
        onChange={(event) => setRate(Number(event.target.value))}
        className="rounded-lg border border-satin bg-surface-overlay px-2 py-1 text-xs"
      >
        {RATES.map((value) => (
          <option key={value} value={value}>
            {value}x
          </option>
        ))}
      </select>
      {objectUrl ? (
        <a
          className="btn-ghost inline-flex items-center gap-1 text-xs"
          href={objectUrl}
          download={`answer-${answerId}.${audioExtension(mimeType)}`}
        >
          <Download aria-hidden />
          {t('employer.campaigns.results.detail.download')}
        </a>
      ) : null}
    </div>
  );
}
