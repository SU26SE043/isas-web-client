import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useLanguage } from '@/shared/languages';
import { useAudioRecorder } from '@/features/practice/hooks/useAudioRecorder';
import { formatAudioClock } from '@/features/practice/utils/audioRecorder.utils';

/** 3 phút: đủ cho một câu trả lời phỏng vấn dài; trần file 15 MB bên BE dư cho mức này. */
export const RUBRIC_TRY_MAX_SECONDS = 180;
/** `useAudioRecorder` chỉ dùng hai id này để đặt tên file — không có buổi luyện nào đứng sau. */
const TRY_SESSION_ID = 'admin-rubric-try';

interface RubricTryVoiceRecorderProps {
  /** Đổi câu hỏi ⇒ đổi khoá ⇒ hook tự bỏ bản ghi cũ (panel đã hỏi trước khi đổi). */
  questionKey: string;
  transcribing: boolean;
  disabled?: boolean;
  onTranscribe: (file: File) => void;
  /** Ghi lại ⇒ bỏ luôn bản chép/số đo của bản ghi cũ ở tầng luồng. */
  onReset: () => void;
}

/**
 * Bộ ghi âm cho màn "tự thử thước đo": mic → dừng → nghe lại / ghi lại → CHÉP LỜI (chủ động bấm,
 * không tự gửi — tránh tốn lượt chép cho bản ghi bấm nhầm). Cố ý không dùng `AudioRecorderBody`
 * của phòng luyện: khối đó cao 390px, nhãn "Nộp câu trả lời" và gắn với một buổi thi.
 */
export function RubricTryVoiceRecorder({ questionKey, transcribing, disabled, onTranscribe, onReset }: RubricTryVoiceRecorderProps) {
  const { t } = useLanguage();
  const recorder = useAudioRecorder({ sessionId: TRY_SESSION_ID, questionId: questionKey, maxDurationSeconds: RUBRIC_TRY_MAX_SECONDS });
  const { state } = recorder;
  const clock = `${formatAudioClock(state.elapsedSeconds)} / ${formatAudioClock(RUBRIC_TRY_MAX_SECONDS)}`;
  const busy = disabled || transcribing;

  const retake = () => { recorder.resetRecording(); onReset(); };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-satin bg-surface-overlay/60 p-5 text-center" data-recorder-status={state.status}>
      {state.status === 'idle' || state.status === 'requesting-permission' || state.status === 'error' ? (
        <>
          <button
            type="button"
            aria-label={t('admin.rubrics.try.voice.start')}
            onClick={() => void recorder.startRecording()}
            disabled={busy || state.status === 'requesting-permission'}
            className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            <MicIcon />
          </button>
          <p className="text-sm font-medium text-foreground">
            {state.status === 'requesting-permission' ? t('admin.rubrics.try.voice.requesting') : t('admin.rubrics.try.voice.start')}
          </p>
          <p className="text-xs text-muted-foreground">{t('admin.rubrics.try.voice.hint')}</p>
          {state.status === 'error' ? (
            <p role="alert" className="text-xs text-error">
              {state.errorKind === 'permission-denied' ? t('admin.rubrics.try.voice.micDenied')
                : state.errorKind === 'too-short' || state.errorKind === 'empty-recording' ? t('admin.rubrics.try.voice.tooShort')
                : state.errorMessage ?? t('admin.rubrics.try.voice.error')}
            </p>
          ) : null}
        </>
      ) : null}

      {state.status === 'recording' ? (
        <>
          <span className="flex size-20 items-center justify-center rounded-full bg-error/15 text-error"><span className="size-5 animate-pulse rounded-full bg-error" /></span>
          <p className="font-mono text-lg tabular-nums text-foreground" aria-live="polite">{clock}</p>
          <Button type="button" variant="destructive" onClick={recorder.stopRecording}>{t('admin.rubrics.try.voice.stop')}</Button>
        </>
      ) : null}

      {state.status === 'recorded' ? (
        <>
          <p className="text-sm text-muted-foreground">{t('admin.rubrics.try.voice.recorded').replace('{clock}', formatAudioClock(state.elapsedSeconds))}</p>
          {state.previewUrl ? <audio ref={recorder.audioElementRef} controls src={state.previewUrl} className="w-full max-w-md" aria-label={t('admin.rubrics.try.voice.replay')} /> : null}
          <div className="flex flex-wrap justify-center gap-2">
            <Button type="button" variant="outline" onClick={retake} disabled={busy}>{t('admin.rubrics.try.voice.retake')}</Button>
            <Button type="button" onClick={() => { if (state.audioFile) onTranscribe(state.audioFile); }} disabled={busy || !state.audioFile} loading={transcribing}>
              {t('admin.rubrics.try.voice.transcribe')}
            </Button>
          </div>
          {transcribing ? <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><Spinner className="size-3" />{t('admin.rubrics.try.voice.transcribing')}</p> : null}
        </>
      ) : null}
    </div>
  );
}

function MicIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
    </svg>
  );
}
