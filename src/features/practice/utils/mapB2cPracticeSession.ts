import type {
  PracticeAnswerReview,
  PracticeBenchmark,
  PracticeBenchmarkCriterion,
  PracticeCriteriaScore,
  PracticeCvVsAnswer,
  PracticeNextAction,
  PracticeQuestionResponse,
  PracticeRubricCriterionRef,
  PracticeSpeakingMetrics,
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

type CriterionCatalog = Map<string, { name: string; maxScore?: number | null }>;

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isGuid(value: string): boolean {
  return GUID_RE.test(value.trim());
}

function unwrapMetric(
  value: unknown,
): { value?: number; note?: string } {
  if (typeof value === 'number' && Number.isFinite(value)) return { value };
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return { value: Number(value) };
  }
  const record = asRecord(value);
  return {
    value: pickNumber(record.value, record.score, record.amount, record.count),
    note: pickString(record.note, record.hint, record.comment, record.description) || undefined,
  };
}

function buildCriterionCatalog(...sources: unknown[]): CriterionCatalog {
  const catalog: CriterionCatalog = new Map();
  const ingest = (raw: unknown) => {
    if (!raw) return;
    if (Array.isArray(raw)) {
      for (const entry of raw) {
        const item = asRecord(entry);
        const id = pickString(item.id, item.criterionId, item.rubricCriterionId);
        const name = pickString(item.name, item.criterionName, item.title, item.label);
        if (!id || !name) continue;
        catalog.set(id, {
          name,
          maxScore: pickNumber(item.maxScore, item.max, item.maxPoints) ?? null,
        });
      }
      return;
    }
    const root = asRecord(raw);
    if (Array.isArray(root.criteria)) ingest(root.criteria);
    if (Array.isArray(root.items)) ingest(root.items);
  };
  for (const source of sources) ingest(source);
  return catalog;
}

function mapCriteriaScore(
  raw: unknown,
  catalog: CriterionCatalog,
  fallbackKey?: string,
): PracticeCriteriaScore | null {
  if (raw == null) return null;

  if (typeof raw === 'number' && Number.isFinite(raw) && fallbackKey) {
    const lookedUp = catalog.get(fallbackKey);
    return {
      name: lookedUp?.name || fallbackKey,
      score: raw,
      maxScore: lookedUp?.maxScore ?? 5,
      comment: null,
      criterionId: isGuid(fallbackKey) ? fallbackKey : null,
    };
  }

  const item = asRecord(raw);
  const nested = asRecord(item.result ?? item.evaluation ?? item.detail ?? item.scoreDetail);
  const criterionId =
    pickString(
      item.criterionId,
      item.rubricCriterionId,
      item.criterionID,
      item.id,
      fallbackKey,
    ) || null;
  const lookedUp = criterionId ? catalog.get(criterionId) : undefined;
  const name =
    pickString(
      item.name,
      item.criterionName,
      item.title,
      item.label,
      item.skill,
      item.dimension,
      lookedUp?.name,
    ) || (criterionId && !isGuid(criterionId) ? criterionId : '');
  const score = pickNumber(
    item.score,
    item.averageScore,
    item.value,
    item.rawScore,
    item.points,
    nested.score,
    nested.value,
  );
  // Keep criterionId-only rows so a later rubric fetch can resolve display names.
  if (score == null) return null;
  const maxScore =
    pickNumber(item.maxScore, item.max, item.maxPoints, item.scale, nested.maxScore) ??
    lookedUp?.maxScore ??
    null;
  const comment =
    pickString(
      item.comment,
      item.feedback,
      item.reason,
      item.explanation,
      item.reasoning,
      nested.comment,
      nested.feedback,
    ) || null;
  const percentage = pickNumber(item.percentage, item.pct, item.percent);
  const weight = pickNumber(item.weight);
  const averageScore = pickNumber(item.averageScore);
  if (!name) {
    if (!criterionId) return null;
    return {
      name: criterionId,
      score,
      maxScore: maxScore ?? 5,
      comment,
      criterionId,
      averageScore: averageScore ?? null,
      percentage: percentage ?? null,
      weight: weight ?? null,
    };
  }
  return {
    name,
    score,
    maxScore,
    comment,
    criterionId,
    averageScore: averageScore ?? null,
    percentage: percentage ?? null,
    weight: weight ?? null,
  };
}

function mapCriteriaList(raw: unknown, catalog: CriterionCatalog): PracticeCriteriaScore[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => mapCriteriaScore(item, catalog))
      .filter((c): c is PracticeCriteriaScore => c != null);
  }
  if (!raw || typeof raw !== 'object') return [];
  const record = raw as Record<string, unknown>;
  // Skip if this looks like a single criterion object, not a map of scores.
  if (
    'score' in record ||
    'criterionId' in record ||
    'name' in record ||
    'criterionName' in record
  ) {
    const single = mapCriteriaScore(record, catalog);
    return single ? [single] : [];
  }
  return Object.entries(record)
    .map(([key, value]) => mapCriteriaScore(value, catalog, key))
    .filter((c): c is PracticeCriteriaScore => c != null);
}

function resolveTextList(raw: unknown, catalog: CriterionCatalog): string[] {
  if (!Array.isArray(raw)) {
    if (typeof raw === 'string' && raw.trim()) {
      return resolveTextList([raw], catalog);
    }
    return [];
  }
  const out: string[] = [];
  for (const entry of raw) {
    if (typeof entry === 'string' && entry.trim()) {
      const text = entry.trim();
      if (isGuid(text)) {
        const name = catalog.get(text)?.name;
        if (name) out.push(name);
        continue;
      }
      out.push(text);
      continue;
    }
    const item = asRecord(entry);
    const text = pickString(
      item.text,
      item.message,
      item.comment,
      item.feedback,
      item.description,
      item.name,
      item.summary,
    );
    if (text) {
      out.push(text);
      continue;
    }
    const id = pickString(item.criterionId, item.id);
    if (id && catalog.get(id)?.name) {
      out.push(catalog.get(id)!.name);
    }
  }
  return out;
}

function mapCvVsAnswerGaps(raw: unknown): PracticeCvVsAnswer['gaps'] {
  if (!Array.isArray(raw)) return null;
  const gaps = raw
    .map((entry) => {
      const item = asRecord(entry);
      const criterionId = pickString(item.criterionId, item.id);
      const criterionName = pickString(item.criterionName, item.name);
      const percentage = pickNumber(item.percentage, item.pct);
      const maxScore = pickNumber(item.maxScore, item.max);
      if (!criterionId || !criterionName || percentage == null || maxScore == null) return null;
      return {
        criterionId,
        criterionName,
        percentage,
        maxScore,
        cvEvidence: pickStringArray(item.cvEvidence ?? item.evidence),
      };
    })
    .filter((gap): gap is NonNullable<typeof gap> => gap != null);
  return gaps.length > 0 ? gaps : null;
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
    cvStrengths: pickStringArray(item.cvStrengths ?? item.strengths),
    gaps: mapCvVsAnswerGaps(item.gaps),
  };
}

function mapBenchmark(raw: unknown): PracticeBenchmark | null {
  if (raw == null) return null;
  const item = asRecord(raw);
  const label = pickString(item.label, item.name, item.title);
  if (!label) return null;
  const criteriaRaw = item.criteria ?? item.items;
  const criteria = Array.isArray(criteriaRaw)
    ? criteriaRaw
        .map((entry) => {
          const criterion = asRecord(entry);
          const criterionId = pickString(criterion.criterionId, criterion.id);
          const name = pickString(criterion.name, criterion.criterionName);
          const targetPercentage = pickNumber(
            criterion.targetPercentage,
            criterion.percentage,
            criterion.targetPct,
            criterion.target,
          );
          if (!criterionId || !name || targetPercentage == null) return null;
          return { criterionId, name, targetPercentage };
        })
        .filter((c): c is PracticeBenchmarkCriterion => c != null)
    : [];
  return {
    source: pickString(item.source) || 'PassThreshold',
    label,
    sampleSize: pickNumber(item.sampleSize, item.n, item.count) ?? 0,
    criteria,
  };
}

function mapResult(raw: unknown, catalog: CriterionCatalog): PracticeSessionResult | null {
  if (raw == null) return null;
  const item = asRecord(raw);
  const overallScore = pickNumber(item.overallScore, item.score, item.totalScore);
  if (overallScore == null) return null;

  const criteriaScores = mapCriteriaList(
    item.criteriaScores ??
      item.criteria ??
      item.rubricScores ??
      item.skillScores ??
      item.dimensions ??
      item.criterionScores ??
      item.scores,
    catalog,
  );

  // Seed catalog from scored criteria that already have names (id → name).
  for (const criterion of criteriaScores) {
    if (criterion.criterionId && criterion.name) {
      catalog.set(criterion.criterionId, {
        name: criterion.name,
        maxScore: criterion.maxScore ?? catalog.get(criterion.criterionId)?.maxScore ?? null,
      });
    }
  }

  return {
    overallScore,
    maxScore: pickNumber(item.maxScore, item.totalMaxScore, item.scoreScale) ?? null,
    passThreshold:
      pickNumber(
        item.passThreshold,
        item.passingScore,
        item.passScore,
        item.internalPassThreshold,
        item.thresholdPct,
      ) ?? (criteriaScores.length >= 3 ? 50 : null),
    passThresholdNote:
      pickString(
        item.passThresholdNote,
        item.thresholdNote,
        item.passThresholdDescription,
        item.thresholdDescription,
      ) || null,
    answeredCount: pickNumber(item.answeredCount) ?? null,
    totalQuestions: pickNumber(item.totalQuestions, item.questionCount) ?? null,
    criteriaScores,
    strengths: resolveTextList(item.strengths, catalog),
    needsImprovement: resolveTextList(item.needsImprovement ?? item.improvements, catalog),
    nextSteps: resolveTextList(item.nextSteps ?? item.recommendations, catalog),
    overallComment: pickString(item.overallComment, item.comment, item.summary, item.feedback),
    cvVsAnswer: mapCvVsAnswer(item.cvVsAnswer ?? item.cvComparison),
    benchmark: mapBenchmark(item.benchmark),
  };
}

function mapFillerBreakdown(raw: unknown): Record<string, number> | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const count = pickNumber(value);
    if (!key.trim() || count == null) continue;
    out[key.trim()] = count;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function mapSpeakingMetrics(raw: unknown): PracticeSpeakingMetrics | null {
  if (raw == null) return null;
  const item = asRecord(raw);
  const notesRaw = item.notes ?? item.hints ?? item.explanations;
  const notes = Array.isArray(notesRaw)
    ? pickStringArray(notesRaw)
    : typeof notesRaw === 'string' && notesRaw.trim()
      ? [notesRaw.trim()]
      : null;

  const speechRate = unwrapMetric(
    item.speechRateWpm ??
      item.speechRate ??
      item.syllablesPerMinute ??
      item.wordsPerMinute ??
      item.spm ??
      item.speech_rate,
  );
  const longestPause = unwrapMetric(
    item.longestPauseSec ??
      item.longestPauseSeconds ??
      item.maxPauseSec ??
      item.longest_pause_sec,
  );
  const hesitation = unwrapMetric(
    item.pauseCount ??
      item.hesitationCount ??
      item.longPauseCount ??
      item.pauses ??
      item.hesitation_count,
  );
  const silence = unwrapMetric(
    item.silenceRatio ?? item.silencePercent ?? item.silencePercentage ?? item.silence_ratio,
  );
  const filler = unwrapMetric(
    item.fillerCount ??
      item.fillerWordCount ??
      item.fillerWordsCount ??
      item.filler_word_count,
  );

  const metrics: PracticeSpeakingMetrics = {
    speechRate: speechRate.value ?? null,
    longestPauseSec: longestPause.value ?? null,
    hesitationCount: hesitation.value ?? null,
    silenceRatio: silence.value ?? null,
    fillerWordCount: filler.value ?? null,
    audioDurationSec:
      pickNumber(
        item.audioSec,
        item.audioDurationSec,
        item.durationSec,
        item.audioLengthSec,
      ) ?? null,
    speechSec: pickNumber(item.speechSec, item.speakingSec, item.talkSec) ?? null,
    wordCount: pickNumber(item.wordCount, item.syllableCount) ?? null,
    fillerPer100Words: pickNumber(item.fillerPer100Words, item.fillerPerHundred) ?? null,
    fillerBreakdown: mapFillerBreakdown(item.fillerBreakdown ?? item.fillers),
    referenceText:
      pickString(item.referenceText, item.reference, item.note, item.speechRateReference) || null,
    speechRateNote:
      speechRate.note ||
      pickString(item.speechRateNote, item.speechRateHint, item.speechRateComment) ||
      null,
    longestPauseNote:
      longestPause.note ||
      pickString(item.longestPauseNote, item.longestPauseHint) ||
      null,
    hesitationNote:
      hesitation.note ||
      pickString(item.hesitationNote, item.pauseNote, item.hesitationHint, item.pauseHint) ||
      null,
    silenceRatioNote:
      silence.note || pickString(item.silenceRatioNote, item.silenceNote) || null,
    fillerWordNote:
      filler.note ||
      pickString(item.fillerWordNote, item.fillerNote, item.fillerWordsNote) ||
      null,
    notes,
  };
  const hasValue = Object.entries(metrics).some(([key, value]) => {
    if (key === 'fillerBreakdown') return value != null && Object.keys(value as object).length > 0;
    if (key === 'notes') return Array.isArray(value) && value.length > 0;
    return value != null;
  });
  return hasValue ? metrics : null;
}

function isClarifyKind(kind?: string, flag?: unknown): boolean {
  if (flag === true) return true;
  const normalized = (kind ?? '').trim().toLowerCase().replace(/[\s_-]+/g, '');
  return (
    normalized === 'clarify' ||
    normalized === 'clarification' ||
    normalized === 'followup' ||
    normalized === 'follow_up' ||
    normalized === 'ailamro'
  );
}

function mapAnswerReview(
  raw: unknown,
  catalog: CriterionCatalog,
): PracticeAnswerReview | null {
  const item = asRecord(raw);
  const evaluation = asRecord(
    item.evaluation ??
      item.result ??
      item.aiEvaluation ??
      item.scoring ??
      item.review ??
      item.grading,
  );
  const questionId = pickString(item.questionId, item.id);
  if (!questionId) return null;
  const kind = pickString(item.kind, item.type, item.questionKind) || undefined;
  const criteriaScores = mapCriteriaList(
    evaluation.criteriaScores ??
      evaluation.criteria ??
      evaluation.rubricScores ??
      evaluation.dimensions ??
      evaluation.criterionScores ??
      evaluation.scores ??
      evaluation.criterionResults ??
      evaluation.scoreBreakdown ??
      evaluation.rubricResult ??
      item.criteriaScores ??
      item.criteria ??
      item.rubricScores ??
      item.criterionScores ??
      item.scores ??
      item.criterionResults,
    catalog,
  );
  return {
    questionId,
    answerId: pickString(item.answerId) || null,
    orderNo: pickNumber(item.orderNo),
    content: pickString(item.content, item.questionContent, item.prompt) || undefined,
    kind,
    transcript:
      typeof item.transcript === 'string'
        ? item.transcript
        : item.transcript === null
          ? null
          : undefined,
    textAnswer: pickString(item.textAnswer, item.answerText, item.responseText) || null,
    audioUrl: pickString(item.audioUrl, item.recordingUrl) || null,
    durationSec: pickNumber(item.durationSec, item.answerDurationSec) ?? null,
    status: pickString(item.status, evaluation.status) || null,
    score: pickNumber(item.score, evaluation.score, evaluation.overallScore) ?? null,
    comment:
      pickString(item.comment, item.feedback, evaluation.comment, evaluation.feedback) || null,
    criteriaScores,
    speakingMetrics: mapSpeakingMetrics(
      item.deliveryMetrics ??
        evaluation.deliveryMetrics ??
        evaluation.speakingMetrics ??
        evaluation.speechMetrics ??
        evaluation.speechAnalysis ??
        evaluation.speech ??
        evaluation.prosody ??
        item.speakingMetrics ??
        item.speechMetrics ??
        item.speechAnalysis ??
        item.speech,
    ),
    suggestedAnswer:
      pickString(
        item.sampleAnswer,
        item.suggestedAnswer,
        item.modelAnswer,
        item.idealAnswer,
        item.exampleAnswer,
        item.referenceAnswer,
        evaluation.sampleAnswer,
        evaluation.suggestedAnswer,
        evaluation.modelAnswer,
        evaluation.idealAnswer,
        evaluation.exampleAnswer,
      ) || null,
    sampleAnswer:
      pickString(
        item.sampleAnswer,
        item.suggestedAnswer,
        evaluation.sampleAnswer,
        evaluation.suggestedAnswer,
      ) || null,
    needsReview: Boolean(item.needsReview ?? evaluation.needsReview),
    isClarify: isClarifyKind(kind, item.isClarify ?? evaluation.isClarify),
  };
}

function mapRubricRefs(raw: unknown): PracticeRubricCriterionRef[] {
  if (!Array.isArray(raw)) {
    const root = asRecord(raw);
    if (Array.isArray(root.criteria)) return mapRubricRefs(root.criteria);
    return [];
  }

  const mapped: PracticeRubricCriterionRef[] = [];
  for (const entry of raw) {
    const item = asRecord(entry);
    const id = pickString(item.id, item.criterionId);
    const name = pickString(item.name, item.criterionName, item.title);
    if (!id || !name) continue;
    mapped.push({
      id,
      name,
      maxScore: pickNumber(item.maxScore, item.max) ?? null,
      description: pickString(item.description) || null,
    });
  }
  return mapped;
}

export function mapPracticeSessionResponse(raw: unknown): PracticeSessionResponse {
  const data = asRecord(raw);
  const resultRaw = data.result ?? data.report ?? data.evaluation ?? data.scoringResult;
  const resultRecord = asRecord(resultRaw);
  const rubric = mapRubricRefs(
    data.rubric ??
      data.rubricCriteria ??
      data.criteriaDefinitions ??
      resultRecord.rubric ??
      resultRecord.rubricCriteria ??
      resultRecord.criteriaDefinitions,
  );
  const catalog = buildCriterionCatalog(
    rubric,
    data.rubric,
    data.rubricCriteria,
    resultRecord.rubric,
    resultRecord.criteriaScores,
    resultRecord.criteria,
  );

  const id = pickString(data.id, data.sessionId);
  const questionsRaw = data.questions;
  const questions = Array.isArray(questionsRaw)
    ? questionsRaw
        .map((item, index) => mapQuestion(item, index))
        .filter((q): q is PracticeQuestionResponse => q != null)
    : [];

  const explicitAnswers = data.answers ?? data.answerReviews ?? data.evaluatedAnswers;
  const answersRaw = Array.isArray(explicitAnswers)
    ? explicitAnswers
    : Array.isArray(questionsRaw)
      ? questionsRaw.map((rawQuestion) => {
          const question = asRecord(rawQuestion);
          const answer = asRecord(
            question.answer ?? question.answerReview ?? question.review,
          );
          const hasAnswerObject = Object.keys(answer).length > 0;
          const source = hasAnswerObject ? answer : question;
          return {
            ...source,
            evaluation:
              asRecord(source).evaluation ??
              question.evaluation ??
              question.review ??
              question.scoring,
            questionId: pickString(
              asRecord(source).questionId,
              question.id,
              question.questionId,
            ),
            orderNo:
              asRecord(source).orderNo ?? question.orderNo ?? question.order,
            content:
              asRecord(source).content ??
              question.content ??
              question.prompt,
            kind: asRecord(source).kind ?? question.kind ?? question.type,
            suggestedAnswer:
              asRecord(source).sampleAnswer ??
              asRecord(source).suggestedAnswer ??
              question.sampleAnswer ??
              question.suggestedAnswer,
            deliveryMetrics:
              asRecord(source).deliveryMetrics ?? question.deliveryMetrics,
          };
        })
      : [];
  const answers = Array.isArray(answersRaw)
    ? answersRaw
        .map((item) => mapAnswerReview(item, catalog))
        .filter((a): a is PracticeAnswerReview => a != null)
    : null;
  const enrichedAnswers =
    answers?.map((answer) => {
      const question = questions.find((item) => item.id === answer.questionId);
      return {
        ...answer,
        orderNo: answer.orderNo ?? question?.orderNo,
        content: answer.content ?? question?.content,
        kind: answer.kind ?? question?.kind,
        isClarify:
          answer.isClarify ||
          isClarifyKind(answer.kind ?? question?.kind),
      };
    }) ?? null;

  // Enrich catalog from answer-level scores that already resolved names.
  for (const answer of enrichedAnswers ?? []) {
    for (const criterion of answer.criteriaScores ?? []) {
      if (criterion.criterionId && criterion.name) {
        catalog.set(criterion.criterionId, {
          name: criterion.name,
          maxScore: criterion.maxScore ?? null,
        });
      }
    }
  }

  const result = mapResult(resultRaw, catalog);

  // If overall criteria empty, aggregate from answers for radar.
  if (result && result.criteriaScores.length === 0 && enrichedAnswers?.length) {
    const byName = new Map<string, PracticeCriteriaScore>();
    for (const answer of enrichedAnswers) {
      for (const item of answer.criteriaScores ?? []) {
        const current = byName.get(item.name);
        if (!current) {
          byName.set(item.name, { ...item });
          continue;
        }
        current.score += item.score;
        if (item.maxScore != null) {
          current.maxScore = (current.maxScore ?? 0) + item.maxScore;
        }
        if (!current.comment && item.comment) current.comment = item.comment;
      }
    }
    result.criteriaScores = Array.from(byName.values());
    if (result.passThreshold == null && result.criteriaScores.length >= 3) {
      result.passThreshold = 50;
    }
  }

  return {
    id,
    status: pickString(data.status) || 'Created',
    jobCategory: pickString(data.jobCategory) || undefined,
    timeLimitSec: pickNumber(data.timeLimitSec, data.timeLimitSeconds),
    questionCount: pickNumber(data.questionCount),
    level: pickString(data.level, data.seniorityLevel) || null,
    durationSeconds: pickNumber(data.durationSeconds, data.durationSec, data.totalDurationSec) ?? null,
    cvId: pickString(data.cvId) || null,
    jdId: pickString(data.jdId) || null,
    createdAt: pickString(data.createdAt) || null,
    completedAt: pickString(data.completedAt, data.scoredAt) || null,
    rubric,
    questions,
    result,
    answers: enrichedAnswers,
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

function listLooksUnresolved(values?: string[] | null): boolean {
  return Boolean(values?.some((value) => isGuid(value)));
}

export function sessionNeedsRubricEnrichment(session: PracticeSessionResponse): boolean {
  if (listLooksUnresolved(session.result?.needsImprovement)) return true;
  if (listLooksUnresolved(session.result?.strengths)) return true;
  const answerCriteria = session.answers?.flatMap((answer) => answer.criteriaScores ?? []) ?? [];
  if (answerCriteria.some((item) => isGuid(item.name) || (item.criterionId != null && isGuid(item.criterionId) && isGuid(item.name)))) {
    return true;
  }
  if ((session.result?.criteriaScores ?? []).some((item) => isGuid(item.name))) return true;
  return false;
}

/** Re-map criterion names after loading rubric catalog for the job category. */
export function applyRubricCatalogToSession(
  session: PracticeSessionResponse,
  rubric: PracticeRubricCriterionRef[],
): PracticeSessionResponse {
  if (!rubric.length) return session;
  const catalog = buildCriterionCatalog(rubric, session.rubric);

  const answers =
    session.answers?.map((answer) => ({
      ...answer,
      criteriaScores: (answer.criteriaScores ?? []).map((item) => {
        const id = item.criterionId;
        if (!id) return item;
        const lookedUp = catalog.get(id);
        if (!lookedUp) return item;
        return {
          ...item,
          name: lookedUp.name,
          maxScore: item.maxScore ?? lookedUp.maxScore ?? null,
        };
      }),
    })) ?? null;

  let result = session.result;
  if (result) {
    const criteriaScores =
      result.criteriaScores.length > 0
        ? result.criteriaScores.map((item) => {
            const id = item.criterionId;
            if (!id) return item;
            const lookedUp = catalog.get(id);
            if (!lookedUp) return item;
            return {
              ...item,
              name: lookedUp.name,
              maxScore: item.maxScore ?? lookedUp.maxScore ?? null,
            };
          })
        : (() => {
            const byName = new Map<string, PracticeCriteriaScore>();
            for (const answer of answers ?? []) {
              for (const item of answer.criteriaScores ?? []) {
                const current = byName.get(item.name);
                if (!current) {
                  byName.set(item.name, { ...item });
                  continue;
                }
                current.score += item.score;
                if (item.maxScore != null) {
                  current.maxScore = (current.maxScore ?? 0) + item.maxScore;
                }
              }
            }
            return Array.from(byName.values());
          })();

    result = {
      ...result,
      criteriaScores,
      needsImprovement: resolveTextList(result.needsImprovement, catalog),
      strengths: resolveTextList(result.strengths, catalog),
      nextSteps: resolveTextList(result.nextSteps, catalog),
      passThreshold:
        result.passThreshold ?? (criteriaScores.length >= 3 ? 50 : null),
    };
  }

  return {
    ...session,
    rubric,
    answers,
    result,
  };
}
