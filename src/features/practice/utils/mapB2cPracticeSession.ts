import type {
  PracticeAnswerReview,
  PracticeCriteriaScore,
  PracticeCvVsAnswer,
  PracticeNextAction,
  PracticeQuestionResponse,
  PracticeSessionResponse,
  PracticeSessionResult,
  SubmitPracticeAnswerResponse,
} from '../types/b2cPracticeSession.types';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function pickStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function mapQuestion(raw: unknown, index: number): PracticeQuestionResponse | null {
  const item = asRecord(raw);
  const id = pickString(item.id, item.questionId);
  if (!id) return null;
  const content = pickString(item.content, item.prompt, item.promptVi, item.title) || 'Question';
  const orderNo = pickNumber(item.orderNo, item.order, item.index) ?? index + 1;
  const timeLimitSec =
    pickNumber(item.timeLimitSec, item.timeLimitSeconds, item.durationSec) ?? 120;
  const kind = pickString(item.kind, item.type, item.questionKind) || 'question';
  return { id, orderNo, content, timeLimitSec, kind };
}

function mapCriteriaScore(raw: unknown): PracticeCriteriaScore | null {
  const item = asRecord(raw);
  const name = pickString(item.name, item.criterionName, item.title);
  const score = pickNumber(item.score, item.value);
  if (!name || score == null) return null;
  return {
    name,
    score,
    maxScore: pickNumber(item.maxScore, item.max) ?? null,
    comment: pickString(item.comment, item.feedback) || null,
  };
}

function mapCvVsAnswer(raw: unknown): PracticeCvVsAnswer | null {
  if (raw == null) return null;
  const item = asRecord(raw);
  return {
    consistencyScore: pickNumber(item.consistencyScore, item.score) ?? null,
    matched: pickStringArray(item.matched ?? item.matchedInfo),
    unclear: pickStringArray(item.unclear ?? item.unclearInfo),
    confirmedSkills: pickStringArray(item.confirmedSkills ?? item.skills),
    differences: pickStringArray(item.differences),
    summary: pickString(item.summary, item.comment) || null,
  };
}

function mapResult(raw: unknown): PracticeSessionResult | null {
  if (raw == null) return null;
  const item = asRecord(raw);
  const overallScore = pickNumber(item.overallScore, item.score, item.totalScore);
  if (overallScore == null) return null;

  const criteriaRaw = item.criteriaScores ?? item.criteria;
  const criteriaScores = Array.isArray(criteriaRaw)
    ? criteriaRaw.map(mapCriteriaScore).filter((c): c is PracticeCriteriaScore => c != null)
    : [];

  const needsRaw = item.needsImprovement ?? item.improvements;
  const needsImprovement = Array.isArray(needsRaw)
    ? pickStringArray(needsRaw)
    : typeof needsRaw === 'string' && needsRaw.trim()
      ? [needsRaw.trim()]
      : [];

  return {
    overallScore,
    criteriaScores,
    needsImprovement,
    overallComment: pickString(item.overallComment, item.comment, item.summary),
    cvVsAnswer: mapCvVsAnswer(item.cvVsAnswer ?? item.cvComparison),
  };
}

function mapAnswerReview(raw: unknown): PracticeAnswerReview | null {
  const item = asRecord(raw);
  const questionId = pickString(item.questionId, item.id);
  if (!questionId) return null;
  return {
    questionId,
    answerId: pickString(item.answerId) || null,
    orderNo: pickNumber(item.orderNo),
    content: pickString(item.content, item.questionContent) || undefined,
    kind: pickString(item.kind) || undefined,
    transcript: typeof item.transcript === 'string' ? item.transcript : item.transcript === null ? null : undefined,
    status: pickString(item.status) || null,
    score: pickNumber(item.score) ?? null,
    comment: pickString(item.comment, item.feedback) || null,
  };
}

export function mapPracticeSessionResponse(raw: unknown): PracticeSessionResponse {
  const data = asRecord(raw);
  const id = pickString(data.id, data.sessionId);
  const questionsRaw = data.questions;
  const questions = Array.isArray(questionsRaw)
    ? questionsRaw
        .map((item, index) => mapQuestion(item, index))
        .filter((q): q is PracticeQuestionResponse => q != null)
    : [];

  const answersRaw = data.answers;
  const answers = Array.isArray(answersRaw)
    ? answersRaw.map(mapAnswerReview).filter((a): a is PracticeAnswerReview => a != null)
    : null;

  return {
    id,
    status: pickString(data.status) || 'Created',
    jobCategory: pickString(data.jobCategory) || undefined,
    timeLimitSec: pickNumber(data.timeLimitSec, data.timeLimitSeconds),
    questionCount: pickNumber(data.questionCount),
    cvId: pickString(data.cvId) || null,
    jdId: pickString(data.jdId) || null,
    questions,
    result: mapResult(data.result),
    answers,
  };
}

function isNextAction(value: string): value is PracticeNextAction {
  return (
    value === 'follow_up' ||
    value === 'clarify' ||
    value === 'new_question' ||
    value === 'end'
  );
}

export function mapSubmitPracticeAnswerResponse(raw: unknown): SubmitPracticeAnswerResponse {
  const data = asRecord(raw);
  const nextActionRaw = pickString(data.nextAction);
  const nextQuestionRaw = data.nextQuestion;
  const nextQuestion =
    nextQuestionRaw && typeof nextQuestionRaw === 'object'
      ? mapQuestion(nextQuestionRaw, 0)
      : null;

  return {
    answerId: pickString(data.answerId, data.id),
    questionId: pickString(data.questionId),
    status: pickString(data.status) || 'submitted',
    transcript:
      typeof data.transcript === 'string'
        ? data.transcript
        : data.transcript === null
          ? null
          : undefined,
    nextAction: nextActionRaw && isNextAction(nextActionRaw) ? nextActionRaw : null,
    nextQuestion,
    interviewComplete: Boolean(data.interviewComplete),
  };
}

export function extractSessionIdFromCreateResponse(raw: unknown): string {
  const mapped = mapPracticeSessionResponse(raw);
  if (mapped.id) return mapped.id;
  const data = asRecord(raw);
  const nested = asRecord(data.data);
  return pickString(data.sessionId, data.id, nested.sessionId, nested.id);
}
