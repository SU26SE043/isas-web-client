import { Eye, MicOff } from 'lucide-react';
import { useLanguage } from '@/shared/languages';
import type { TranscriptQuestion } from '../../../types/campaign.api.types';
import { questionAverageScore } from '../../../utils/resultDetailViewModel';

export function ResultQuestionNav({ questions }: { questions: TranscriptQuestion[] }) {
  const { t } = useLanguage();
  return <nav className="lg:sticky lg:top-24" aria-label={t('employer.campaigns.results.detail.questionNavigation')}><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t('employer.campaigns.results.detail.questions')}</p><div className="flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-2 lg:overflow-visible">{questions.map((question) => <a key={question.questionId} href={`#q-${question.orderNo}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-satin bg-surface-raised px-3 py-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><span>{t('employer.campaigns.results.detail.questionShort').replace('{{number}}', String(question.orderNo))}</span><span className="font-semibold text-foreground">{questionAverageScore(question)?.toFixed(1) ?? '—'}</span>{question.rejectReason === 'no_speech' ? <MicOff className="size-3.5 text-warning" aria-hidden /> : null}{question.needsReview ? <Eye className="size-3.5 text-warning" aria-hidden /> : null}</a>)}</div></nav>;
}
