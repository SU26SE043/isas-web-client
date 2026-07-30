import type {
  PracticeAnswerReview,
  PracticeBenchmark,
  PracticeCriteriaScore,
  PracticeSessionResponse,
  PracticeSessionResult,
  PracticeSpeakingMetrics,
} from '../types/b2cPracticeSession.types';

export type PracticeSessionResultViewModel = {
  id: string;
  title: string;
  jobCategory?: string;
  level?: string;
  status: string;
  createdAt?: string;
  completedAt?: string;
  durationSeconds?: number;
  overallScore?: number;
  maxScore: number;
  passThresholdPct?: number;
  passThresholdNote?: string;
  answeredCount: number;
  skippedCount: number;
  totalQuestions: number;
  averageDurationSec?: number;
  overallFeedback?: string;
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
  criteria: CriteriaResultViewModel[];
  questions: QuestionResultViewModel[];
  hasResult: boolean;
  cvVsAnswerSummary?: string;
  benchmark?: PracticeBenchmark | null;
};

export type CriteriaResultViewModel = {
  name: string;
  score: number;
  maxScore: number;
  pct: number;
  comment?: string;
};

export type QuestionResultViewModel = {
  questionId: string;
  answerId?: string;
  orderNo: number;
  content: string;
  kind?: string;
  timeLimitSec?: number;
  durationSec?: number;
  status?: string;
  score?: number;
  maxScore?: number;
  transcript?: string;
  textAnswer?: string;
  audioUrl?: string;
  comment?: string;
  criteria: CriteriaResultViewModel[];
  speakingMetrics?: PracticeSpeakingMetrics | null;
  suggestedAnswer?: string;
  answered: boolean;
  skipped: boolean;
  isClarify?: boolean;
};

function isAnswered(answer?: PracticeAnswerReview | null): boolean {
  if (!answer) return false;
  const status = (answer.status ?? '').trim().toLowerCase();
  if (status === 'skipped' || status === 'skip' || status === 'unanswered') return false;
  return Boolean(
    (answer.transcript && answer.transcript.trim()) ||
      (answer.textAnswer && answer.textAnswer.trim()) ||
      answer.audioUrl,
  );
}

function mapCriterion(item: PracticeCriteriaScore): CriteriaResultViewModel {
  const score =
    item.averageScore != null && Number.isFinite(item.averageScore)
      ? item.averageScore
      : Number.isFinite(item.score)
        ? item.score
        : 0;
  const maxScore =
    item.maxScore != null && item.maxScore > 0
      ? item.maxScore
      : score > 5
        ? 100
        : 5;
  const pct =
    item.percentage != null && Number.isFinite(item.percentage)
      ? Math.max(0, Math.min(100, item.percentage))
      : Math.max(0, Math.min(100, (score / maxScore) * 100));
  return {
    name: item.name,
    score,
    maxScore,
    pct,
    comment: item.comment?.trim() || undefined,
  };
}

function resolvePassThresholdPct(
  result: PracticeSessionResult,
  maxScore: number,
): number | undefined {
  if (result.passThreshold == null || !Number.isFinite(result.passThreshold)) return undefined;
  const value = result.passThreshold;
  if (value >= 0 && value <= 1) return value * 100;
  if (value > 0 && value <= 100 && (maxScore === 100 || value <= maxScore)) {
    // Prefer percentage when value is clearly a 0–100 threshold.
    if (maxScore === 100 || value <= 100) return Math.min(100, value);
  }
  if (maxScore > 0) return Math.max(0, Math.min(100, (value / maxScore) * 100));
  return undefined;
}

export function mapPracticeSessionResponseToViewModel(
  session: PracticeSessionResponse,
): PracticeSessionResultViewModel {
  const result = session.result ?? null;
  const maxScore = result?.maxScore != null && result.maxScore > 0 ? result.maxScore : 100;
  const questionsSource = session.questions.length
    ? session.questions
    : (session.answers ?? []).map((answer, index) => ({
        id: answer.questionId,
        orderNo: answer.orderNo ?? index + 1,
        content: answer.content ?? '',
        timeLimitSec: session.timeLimitSec ?? 0,
        kind: answer.kind ?? 'question',
      }));

  const questions: QuestionResultViewModel[] = questionsSource.map((question, index) => {
    const answer =
      session.answers?.find((item) => item.questionId === question.id) ?? null;
    const criteria = (answer?.criteriaScores ?? []).map(mapCriterion);
    const scoreSum = criteria.reduce((sum, item) => sum + item.score, 0);
    const maxSum = criteria.reduce((sum, item) => sum + item.maxScore, 0);
    const answered = isAnswered(answer);
    const status = answer?.status?.trim() || (answered ? 'Answered' : 'Skipped');

    return {
      questionId: question.id,
      answerId: answer?.answerId ?? undefined,
      orderNo: question.orderNo || answer?.orderNo || index + 1,
      content: answer?.content?.trim() || question.content || '',
      kind: answer?.kind || question.kind,
      timeLimitSec: question.timeLimitSec || session.timeLimitSec,
      durationSec: answer?.durationSec ?? undefined,
      status,
      score:
        answer?.score != null && Number.isFinite(answer.score)
          ? answer.score
          : criteria.length
            ? scoreSum
            : undefined,
      maxScore: criteria.length ? maxSum : undefined,
      transcript: answer?.transcript?.trim() || undefined,
      textAnswer: answer?.textAnswer?.trim() || undefined,
      audioUrl: answer?.audioUrl || undefined,
      comment: answer?.comment?.trim() || undefined,
      criteria,
      speakingMetrics: answer?.speakingMetrics ?? null,
      suggestedAnswer:
        answer?.sampleAnswer?.trim() ||
        answer?.suggestedAnswer?.trim() ||
        undefined,
      answered,
      skipped: !answered,
      isClarify:
        answer?.isClarify === true ||
        /clarify|follow.?up/i.test(answer?.kind || question.kind || ''),
    };
  });

  const answeredCount =
    result?.answeredCount != null && Number.isFinite(result.answeredCount)
      ? result.answeredCount
      : questions.filter((item) => item.answered).length;
  const totalQuestions =
    result?.totalQuestions != null && Number.isFinite(result.totalQuestions)
      ? result.totalQuestions
      : (session.questionCount ?? questions.length);
  const skippedCount = Math.max(0, totalQuestions - answeredCount);
  const durationValues = questions
    .map((item) => item.durationSec)
    .filter((value): value is number => value != null && Number.isFinite(value) && value > 0);
  const averageDurationSec =
    durationValues.length > 0
      ? Math.round(durationValues.reduce((sum, value) => sum + value, 0) / durationValues.length)
      : undefined;

  const jobCategory =
    typeof session.jobCategory === 'string' && session.jobCategory.trim()
      ? session.jobCategory.trim()
      : undefined;

  const overallCriteria = (result?.criteriaScores ?? []).map(mapCriterion);
  const criteria =
    overallCriteria.length > 0
      ? overallCriteria
      : aggregateCriteriaFromQuestions(questions);

  return {
    id: session.id,
    title: jobCategory ?? '',
    jobCategory,
    level: session.level?.trim() || undefined,
    status: session.status,
    createdAt: session.createdAt ?? undefined,
    completedAt: session.completedAt ?? undefined,
    durationSeconds: session.durationSeconds ?? undefined,
    overallScore: result?.overallScore,
    maxScore,
    passThresholdPct: result ? resolvePassThresholdPct(result, maxScore) : undefined,
    passThresholdNote: result?.passThresholdNote?.trim() || undefined,
    answeredCount,
    skippedCount,
    totalQuestions,
    averageDurationSec,
    overallFeedback: result?.overallComment?.trim() || undefined,
    strengths: result?.strengths?.filter(Boolean) ?? [],
    improvements: result?.needsImprovement?.filter(Boolean) ?? [],
    nextSteps: result?.nextSteps?.filter(Boolean) ?? [],
    criteria,
    questions,
    hasResult: Boolean(result),
    cvVsAnswerSummary: result?.cvVsAnswer?.summary?.trim() || undefined,
    benchmark: result?.benchmark ?? null,
  };
}

function aggregateCriteriaFromQuestions(
  questions: QuestionResultViewModel[],
): CriteriaResultViewModel[] {
  const byName = new Map<string, { score: number; maxScore: number; comment?: string }>();
  for (const question of questions) {
    for (const item of question.criteria) {
      const current = byName.get(item.name);
      if (!current) {
        byName.set(item.name, {
          score: item.score,
          maxScore: item.maxScore,
          comment: item.comment,
        });
        continue;
      }
      current.score += item.score;
      current.maxScore += item.maxScore;
      if (!current.comment && item.comment) current.comment = item.comment;
    }
  }
  return Array.from(byName.entries()).map(([name, value]) => ({
    name,
    score: value.score,
    maxScore: value.maxScore,
    pct: value.maxScore > 0 ? Math.max(0, Math.min(100, (value.score / value.maxScore) * 100)) : 0,
    comment: value.comment,
  }));
}
