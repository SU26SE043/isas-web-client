import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, MicOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/shared/languages';
import type { TranscriptQuestion } from '../../../types/campaign.api.types';
import { questionAverageScore, questionKindKeys } from '../../../utils/resultDetailViewModel';
import { AnswerAudioPlayer } from './AnswerAudioPlayer';

const TRANSCRIPT_CLAMP_CHARS = 220;
const WARNING_CHIP = 'border-warning/30 bg-warning/10 text-warning';

// Trạng thái câu trả lời cho HR — thứ tự ưu tiên có chủ đích:
// no_speech (im lặng, CAMP-21) > Skipped không audio (bỏ trống) > Failed (chấm lỗi) > needsReview (E10).
// "Bỏ trống" chỉ khi KHÔNG có audio — Skipped mà có audio là bài im lặng hoặc buổi bị chốt sổ, không phải bỏ.
function statusChip(question: TranscriptQuestion, t: (key: string) => string) {
  if (question.rejectReason === 'no_speech') {
    return { label: t('employer.campaigns.results.detail.noSpeech'), warning: true };
  }
  if (question.answerStatus === 'Skipped' && !question.hasAudio) {
    return { label: t('employer.campaigns.results.detail.skipped'), warning: false };
  }
  if (question.answerStatus === 'Failed') {
    return { label: t('employer.campaigns.results.detail.scoringFailed'), warning: false };
  }
  if (question.needsReview) {
    return { label: t('employer.campaigns.results.detail.needsReviewChip'), warning: true };
  }
  return null;
}

export function ResultQuestionCard({
  question,
  campaignId,
  sessionId,
}: {
  question: TranscriptQuestion;
  campaignId: string;
  sessionId: string;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(true);
  const [full, setFull] = useState(false);
  const average = questionAverageScore(question);
  const status = statusChip(question, t);
  const transcript = question.transcript?.trim() ?? '';
  const clampable = transcript.length > TRANSCRIPT_CLAMP_CHARS;

  return (
    <article id={`q-${question.orderNo}`} className="frame-satin scroll-mt-24 overflow-hidden rounded-xl bg-surface-raised">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-satin px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-foreground">
            {t('employer.campaigns.results.detail.question').replace('{{number}}', String(question.orderNo))}
          </h2>
          <Badge variant="outline">{t(questionKindKeys[question.kind])}</Badge>
          {status ? (
            <Badge variant="outline" className={status.warning ? WARNING_CHIP : ''}>
              {status.label}
            </Badge>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {average == null ? '—' : `${average.toFixed(1)}/10`}
          </span>
          <button type="button" className="btn-ghost p-1" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
            {open ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="space-y-4 p-4">
          <p className="font-medium leading-relaxed text-foreground">{question.content}</p>

          <div className="rounded-lg bg-surface-overlay p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t('employer.campaigns.results.detail.transcript')}
              </p>
              {question.needsReview ? (
                <Eye className="size-4 text-warning" aria-label={t('employer.campaigns.results.detail.needsReviewChip')} />
              ) : null}
            </div>
            <p className={`mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground ${full ? '' : 'line-clamp-3'}`}>
              {transcript || t('employer.campaigns.results.transcript.emptyAnswer')}
            </p>
            {clampable ? (
              <button type="button" className="mt-2 text-xs font-medium text-info underline" onClick={() => setFull((value) => !value)}>
                {full ? t('employer.campaigns.results.detail.collapse') : t('employer.campaigns.results.detail.expand')}
              </button>
            ) : null}
            {question.rejectReason === 'no_speech' ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-warning">
                <MicOff className="size-3.5" aria-hidden />
                {t('employer.campaigns.results.detail.noSpeech')}
              </p>
            ) : null}
            {question.hasAudio && question.answerId ? (
              <AnswerAudioPlayer campaignId={campaignId} sessionId={sessionId} answerId={question.answerId} />
            ) : null}
          </div>

          <DeliveryMetrics question={question} />

          {question.scores.length ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">{t('employer.campaigns.results.detail.scoreBreakdown')}</h3>
              {question.scores.map((score) => (
                <div key={score.criterionId} className="rounded-lg border border-satin p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-foreground">
                      {score.criterionName || t('employer.campaigns.results.transcript.criterion')}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {score.score}
                      {score.maxScore != null ? ` / ${score.maxScore}` : ''}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-overlay">
                    <span
                      className="block h-full bg-foreground"
                      style={{ width: `${score.maxScore ? Math.min(100, (score.score / score.maxScore) * 100) : 0}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {score.reasoning || t('employer.campaigns.results.transcript.noReasoning')}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {question.sampleAnswer ? (
            <details className="rounded-lg border border-satin p-3">
              <summary className="cursor-pointer text-sm font-medium text-foreground">
                {t('employer.campaigns.results.detail.sampleAnswer')}
              </summary>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{question.sampleAnswer}</p>
            </details>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

// F11 — chỉ số cách nói. null = CHƯA ĐO (hiện "chưa đo"), KHÔNG hiện 0 như một lời khen.
// Dải tốc độ VI 180–320 âm tiết/phút (đã hiệu chuẩn — F11); dưới = chậm, trên = nhanh.
function DeliveryMetrics({ question }: { question: TranscriptQuestion }) {
  const { t } = useLanguage();
  const metrics = question.deliveryMetrics;
  const notMeasured = t('employer.campaigns.results.detail.notMeasured');
  const value = (item: number | null | undefined, suffix = '') => (item == null ? notMeasured : `${item}${suffix}`);
  const speedLabel =
    metrics?.speechRateWpm == null
      ? notMeasured
      : metrics.speechRateWpm < 180
        ? t('employer.campaigns.results.detail.slow')
        : metrics.speechRateWpm > 320
          ? t('employer.campaigns.results.detail.fast')
          : t('employer.campaigns.results.detail.medium');
  const pauses =
    metrics?.pauseCount == null ? notMeasured : `${metrics.pauseCount} · ${value(metrics.longestPauseSec, 's')}`;
  return (
    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      <Badge variant="outline">
        {t('employer.campaigns.results.detail.speed')}:{' '}
        {metrics?.speechRateWpm == null ? notMeasured : `${metrics.speechRateWpm} wpm · ${speedLabel}`}
      </Badge>
      <Badge variant="outline">
        {t('employer.campaigns.results.detail.pauses')}: {pauses}
      </Badge>
      <Badge variant="outline">
        {t('employer.campaigns.results.detail.fillers')}: {value(metrics?.fillerCount)}
      </Badge>
    </div>
  );
}
