import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/shared/languages';
import type { RubricTryFlow, RubricTryMode } from '../../hooks/useRubricTryFlow';
import { RubricTryVoiceRecorder } from './RubricTryVoiceRecorder';

interface RubricTryAnswerInputProps {
  flow: RubricTryFlow;
  questionKey: string;
  disabled?: boolean;
}

const CHIP = 'inline-flex max-w-full items-start gap-1 rounded-full px-2.5 py-1 text-xs leading-snug';
const SEGMENT = 'rounded-lg px-3 py-1.5 text-sm transition aria-pressed:bg-surface-overlay aria-pressed:font-medium aria-pressed:text-foreground text-muted-foreground hover:text-foreground';

/**
 * Khối "Bài của bạn": NÓI là trung tâm, DÁN BÀI là lối thoát (không ngang hàng). Bản chép lời hiện
 * trong ô SỬA ĐƯỢC ngay dưới bản ghi — người dùng nghe-đối-chiếu rồi sửa chỗ máy nghe sai, sau đó
 * mới có nút Chấm (ở panel). Chip nói rõ hai nguồn: điểm nội dung chấm trên CHỮ, số đo cách nói
 * theo BẢN GHI — không để hai thứ bị hiểu là một.
 */
export function RubricTryAnswerInput({ flow, questionKey, disabled }: RubricTryAnswerInputProps) {
  const { t } = useLanguage();
  const setMode = (next: RubricTryMode) => { if (next !== flow.mode) flow.switchMode(next); };
  const showTranscript = flow.mode === 'voice' && flow.transcribedText !== null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>{t('admin.rubrics.try.answer')}</Label>
        <div role="group" aria-label={t('admin.rubrics.try.mode')} className="inline-flex rounded-lg border border-satin bg-surface-raised p-0.5">
          <button type="button" aria-pressed={flow.mode === 'voice'} onClick={() => setMode('voice')} disabled={disabled} className={SEGMENT}>{t('admin.rubrics.try.mode.voice')}</button>
          <button type="button" aria-pressed={flow.mode === 'paste'} onClick={() => setMode('paste')} disabled={disabled} className={SEGMENT}>{t('admin.rubrics.try.mode.paste')}</button>
        </div>
      </div>

      {flow.mode === 'voice' ? (
        <>
          <RubricTryVoiceRecorder
            questionKey={questionKey}
            transcribing={flow.transcribe.isPending}
            disabled={disabled}
            onTranscribe={(file) => flow.transcribe.mutate(file)}
            onReset={flow.resetAnswer}
          />
          {flow.transcribe.isError ? <p role="alert" className="text-sm text-error">{t('admin.rubrics.try.voice.transcribeError')}</p> : null}
          {flow.noSpeech ? <p role="alert" className="text-sm text-warning">{t('admin.rubrics.try.voice.noSpeech')}</p> : null}
          {showTranscript && !flow.noSpeech ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="rubric-try-transcript">{t('admin.rubrics.try.transcript')}</Label>
                {flow.transcriptEdited ? <span className="text-xs text-info">{t('admin.rubrics.try.transcriptEdited')}</span> : null}
              </div>
              <p className="text-xs text-muted-foreground">{t('admin.rubrics.try.transcriptHint')}</p>
              <Textarea id="rubric-try-transcript" value={flow.answerText} rows={5} disabled={disabled} onChange={(event) => flow.setAnswerText(event.target.value)} />
            </div>
          ) : null}
        </>
      ) : (
        <div className="space-y-1.5">
          <Textarea
            id="rubric-try-paste"
            aria-label={t('admin.rubrics.try.mode.paste')}
            value={flow.answerText}
            rows={6}
            disabled={disabled}
            onChange={(event) => flow.setAnswerText(event.target.value)}
            placeholder={t('admin.rubrics.try.paste.placeholder')}
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {flow.hasAudioMetrics
          ? <span className={`${CHIP} bg-info/10 text-info`}>{t('admin.rubrics.try.chip.willMeasure')}</span>
          : <span className={`${CHIP} bg-warning/10 text-warning`}>{t('admin.rubrics.try.chip.noAudio')}</span>}
      </div>

      <label className="flex items-start gap-3 text-sm text-muted-foreground">
        <input type="checkbox" checked={flow.includeAiSamples} disabled={disabled} onChange={(event) => flow.setIncludeAiSamples(event.target.checked)} className="mt-1" />
        <span>
          <span className="block text-foreground">{t('admin.rubrics.try.aiSamples.toggle')}</span>
          <span className="block text-xs">{t('admin.rubrics.try.aiSamples.hint')}</span>
        </span>
      </label>
    </div>
  );
}
