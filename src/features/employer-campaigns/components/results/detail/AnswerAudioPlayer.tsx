import { useEffect, useRef, useState } from 'react';
import { Download, Pause, Play } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useAnswerAudio } from '../../../hooks/useCampaignResults';

const EVENT = 'isas-result-audio-play';
export function AnswerAudioPlayer({ campaignId, sessionId, answerId }: { campaignId: string; sessionId: string; answerId: string }) {
  const { t } = useLanguage();
  const { state, objectUrl, load } = useAnswerAudio(campaignId, sessionId, answerId);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [pendingPlay, setPendingPlay] = useState(false);
  const [rate, setRate] = useState(1);
  useEffect(() => { const pause = (event: Event) => { if (event.target !== audioRef.current) { audioRef.current?.pause(); setPlaying(false); } }; window.addEventListener(EVENT, pause); return () => window.removeEventListener(EVENT, pause); }, []);
  useEffect(() => { if (audioRef.current) audioRef.current.playbackRate = rate; }, [rate, objectUrl]);
  useEffect(() => {
    if (!objectUrl || !pendingPlay || !audioRef.current) return;
    setPendingPlay(false);
    window.dispatchEvent(new Event(EVENT));
    void audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [objectUrl, pendingPlay]);
  if (state === 'error') return <p className="mt-3 text-sm text-destructive">{t('employer.campaigns.results.detail.audioError')}</p>;
  const toggle = async () => { if (!objectUrl) { setPendingPlay(true); await load(); return; } const audio = audioRef.current; if (!audio) return; if (audio.paused) { window.dispatchEvent(new Event(EVENT)); await audio.play(); setPlaying(true); } else { audio.pause(); setPlaying(false); } };
  const duration = audioRef.current?.duration ?? 0;
  const format = (value: number) => `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, '0')}`;
  return <div className="mt-4 flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" onClick={() => void toggle()} disabled={state === 'loading'}>{state === 'loading' ? <Spinner className="size-4" /> : playing ? <Pause aria-hidden /> : <Play aria-hidden />}{playing ? t('employer.campaigns.results.detail.pause') : t('employer.campaigns.results.detail.play')}</Button><audio ref={audioRef} src={objectUrl ?? undefined} preload="metadata" className="hidden" onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => setPlaying(false)} /><input aria-label={t('employer.campaigns.results.detail.audioProgress')} className="min-w-[140px] flex-1 accent-foreground" type="range" min="0" max={duration || 0} value={currentTime} onChange={(event) => { if (audioRef.current) audioRef.current.currentTime = Number(event.target.value); }} disabled={!objectUrl} /><span className="text-xs tabular-nums text-muted-foreground">{format(currentTime)} / {format(duration)}</span><select aria-label={t('employer.campaigns.results.detail.playbackRate')} value={rate} onChange={(event) => setRate(Number(event.target.value))} className="border-satin bg-surface-overlay px-2 py-1 text-xs"><option value={1}>1x</option><option value={1.5}>1.5x</option><option value={2}>2x</option></select>{objectUrl ? <a className="btn-ghost inline-flex items-center gap-1 text-xs" href={objectUrl} download={`answer-${answerId}.webm`}><Download aria-hidden />{t('employer.campaigns.results.detail.download')}</a> : null}</div>;
}
