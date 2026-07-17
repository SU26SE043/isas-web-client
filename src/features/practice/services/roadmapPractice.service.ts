import axios from 'axios';
import { apiClient } from '@/shared/api/apiClient';
import { getApiStatusCode } from '@/shared/api/apiError';
import { learningEndpoints } from './learning.endpoints';
import type {
  PracticeAnswerDetail,
  PracticeSessionQuestionDto,
  PracticeSessionResponse,
  RoadmapPracticeReport,
  RoadmapReportKind,
  StartLessonResult,
  SubmitPracticeAnswerInput,
  SubmitPracticeAnswerResponse,
} from '../types/roadmapPractice.api.types';
import type { RadarData } from '../types/result.types';

const MAX_ANSWER_BYTES = 50 * 1024 * 1024;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function pickNumber(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function pickStringArray(...values: unknown[]): string[] {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
    }
  }
  return [];
}

function unwrapData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  const record = data as Record<string, unknown>;
  if ('data' in record && record.data != null && typeof record.data === 'object') {
    return record.data;
  }
  return data;
}

function mapQuestion(raw: unknown, index: number): PracticeSessionQuestionDto {
  const item = asRecord(raw);
  const id = pickString(item.id, item.questionId) || `q-${index + 1}`;
  return {
    id,
    orderNo: pickNumber(item.orderNo, item.order, index + 1),
    content: pickString(item.content, item.prompt, item.title, item.question),
    prompt: pickString(item.prompt, item.content, item.title),
    promptVi: pickString(item.promptVi, item.contentVi, item.titleVi),
    title: pickString(item.title, item.prompt, item.content),
    timeLimitSeconds: pickNumber(item.timeLimitSeconds, item.durationSec, 120) || 120,
    durationSec: pickNumber(item.durationSec, item.timeLimitSeconds, 120) || 120,
  };
}

export function mapPracticeSessionResponse(raw: unknown): PracticeSessionResponse {
  const item = asRecord(unwrapData(raw));
  const sessionId = pickString(item.sessionId, item.id);
  const questionsRaw = Array.isArray(item.questions) ? item.questions : [];
  return {
    sessionId,
    id: pickString(item.id) || undefined,
    title: pickString(item.title, item.name) || undefined,
    status: pickString(item.status) || undefined,
    currentQuestionIndex: pickNumber(item.currentQuestionIndex, item.currentIndex),
    questions: questionsRaw.map(mapQuestion),
  };
}

function mapAnswerDetail(raw: unknown): PracticeAnswerDetail {
  const item = asRecord(unwrapData(raw));
  const evaluation = asRecord(item.evaluation ?? item.feedbackDetail ?? item.scoreDetail);
  return {
    answerId: pickString(item.answerId, item.id),
    questionId: pickString(item.questionId),
    status: pickString(item.status, item.scoringStatus, 'Pending'),
    scoringStatus: pickString(item.scoringStatus, item.status),
    score: pickNumber(item.score, evaluation.score) || undefined,
    feedback: pickString(item.feedback, item.comment, evaluation.feedback, evaluation.comment),
    feedbackVi: pickString(item.feedbackVi, item.commentVi, evaluation.feedbackVi),
    strengths: pickStringArray(item.strengths, evaluation.strengths),
    strengthsVi: pickStringArray(item.strengthsVi, evaluation.strengthsVi),
    weaknesses: pickStringArray(
      item.weaknesses,
      item.improvements,
      evaluation.weaknesses,
      evaluation.improvements,
    ),
    weaknessesVi: pickStringArray(item.weaknessesVi, item.improvementsVi, evaluation.weaknessesVi),
    improvements: pickStringArray(item.improvements, item.tips, evaluation.improvements),
    improvementsVi: pickStringArray(item.improvementsVi, item.tipsVi, evaluation.improvementsVi),
    betterAnswer: pickString(item.betterAnswer, evaluation.betterAnswer),
    betterAnswerVi: pickString(item.betterAnswerVi, evaluation.betterAnswerVi),
    transcript: pickString(item.transcript) || null,
    tips: pickStringArray(item.tips, item.improvements, evaluation.tips),
    tipsVi: pickStringArray(item.tipsVi, item.improvementsVi, evaluation.tipsVi),
  };
}

function mapRadar(raw: unknown): RadarData[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const row = asRecord(item);
    return {
      subject: pickString(row.subject, row.name, row.label, `Skill ${index + 1}`),
      subjectVi:
        pickString(row.subjectVi, row.nameVi, row.labelVi) ||
        pickString(row.subject, row.name, row.label, `Skill ${index + 1}`),
      A: pickNumber(row.A, row.current, row.value, row.score),
      B: pickNumber(row.B, row.target, row.goal),
      fullMark: pickNumber(row.fullMark, 100) || 100,
    };
  });
}

function mapRoadmapReport(raw: unknown, roadmapId: string): RoadmapPracticeReport {
  const item = asRecord(unwrapData(raw));
  const status = pickString(item.roadmapStatus, item.status).toLowerCase();
  const kindRaw = pickString(item.kind, item.reportKind, item.reportType).toLowerCase();
  let kind: RoadmapReportKind = 'interim';
  if (kindRaw === 'snapshot' || status === 'completed' || status === 'done') {
    kind = 'snapshot';
  }
  return {
    roadmapId: pickString(item.roadmapId, item.id) || roadmapId,
    kind,
    roadmapStatus: pickString(item.roadmapStatus, item.status) || undefined,
    levelEvaluation: pickString(item.levelEvaluation, item.level, item.evaluation),
    levelEvaluationVi: pickString(item.levelEvaluationVi, item.levelVi, item.evaluationVi),
    overallComment: pickString(item.overallComment, item.comment, item.summary),
    overallCommentVi: pickString(item.overallCommentVi, item.commentVi, item.summaryVi),
    strengths: pickStringArray(item.strengths),
    strengthsVi: pickStringArray(item.strengthsVi),
    weaknesses: pickStringArray(item.weaknesses),
    weaknessesVi: pickStringArray(item.weaknessesVi),
    improvements: pickStringArray(item.improvements, item.tips),
    improvementsVi: pickStringArray(item.improvementsVi, item.tipsVi),
    radarData: mapRadar(item.radarData ?? item.radar ?? item.skills),
  };
}

function extractConflictSessionId(error: unknown): string | undefined {
  if (!axios.isAxiosError(error)) return undefined;
  const data = unwrapData(error.response?.data);
  const record = asRecord(data);
  return pickString(record.sessionId, asRecord(record.error).sessionId) || undefined;
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isScoredStatus(status: string): boolean {
  const raw = status.toLowerCase();
  return (
    raw === 'scored' ||
    raw === 'done' ||
    raw === 'completed' ||
    raw === 'evaluated' ||
    raw === 'ready' ||
    raw === 'success'
  );
}

export const roadmapPracticeService = {
  maxAnswerBytes: MAX_ANSWER_BYTES,

  async startLesson(roadmapId: string, lessonId: string): Promise<StartLessonResult> {
    try {
      const response = await apiClient.post(
        learningEndpoints.startLesson(roadmapId, lessonId),
        {},
        { validateStatus: (status) => status === 201 || (status >= 200 && status < 300) },
      );
      const session = mapPracticeSessionResponse(response.data);
      if (!session.sessionId) {
        return { ok: false, code: 'generic', message: 'Missing sessionId' };
      }
      return { ok: true, session, resumed: false };
    } catch (error) {
      const status = getApiStatusCode(error);
      if (status === 409) {
        const sessionId = extractConflictSessionId(error);
        if (sessionId) {
          return {
            ok: true,
            resumed: true,
            session: { sessionId },
          };
        }
        return { ok: false, code: 'conflict_resume', message: 'Session conflict' };
      }
      if (status === 402) return { ok: false, code: 'insufficient_credits' };
      if (status === 403) return { ok: false, code: 'forbidden' };
      if (status === 404) return { ok: false, code: 'not_found' };
      if (status === 502) return { ok: false, code: 'ai_failed' };
      return { ok: false, code: 'generic' };
    }
  },

  async getPracticeSession(sessionId: string): Promise<PracticeSessionResponse> {
    const response = await apiClient.get(learningEndpoints.practiceSession(sessionId));
    const mapped = mapPracticeSessionResponse(response.data);
    return { ...mapped, sessionId: mapped.sessionId || sessionId };
  },

  async submitAnswer(
    sessionId: string,
    input: SubmitPracticeAnswerInput,
  ): Promise<SubmitPracticeAnswerResponse> {
    if (input.file.size > MAX_ANSWER_BYTES) {
      throw new Error('ANSWER_FILE_TOO_LARGE');
    }
    const form = new FormData();
    form.append('questionId', input.questionId);
    form.append('durationSec', String(Math.max(1, Math.round(input.durationSec))));
    const fileName = input.fileName ?? 'answer.webm';
    form.append('file', input.file, fileName);

    const response = await apiClient.post(learningEndpoints.submitAnswer(sessionId), form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return mapAnswerDetail(response.data);
  },

  async getAnswer(sessionId: string, answerId: string): Promise<PracticeAnswerDetail> {
    const response = await apiClient.get(learningEndpoints.answer(sessionId, answerId));
    return mapAnswerDetail(response.data);
  },

  async waitForAnswerScore(
    sessionId: string,
    answerId: string,
    initial?: PracticeAnswerDetail,
    options?: { attempts?: number; intervalMs?: number },
  ): Promise<PracticeAnswerDetail> {
    const attempts = options?.attempts ?? 12;
    const intervalMs = options?.intervalMs ?? 1500;
    let latest = initial ?? (await this.getAnswer(sessionId, answerId));
    if (latest.score != null || isScoredStatus(latest.status)) {
      return latest;
    }
    for (let i = 0; i < attempts; i += 1) {
      await sleep(intervalMs);
      try {
        latest = await this.getAnswer(sessionId, answerId);
        if (latest.score != null || isScoredStatus(latest.status)) {
          return latest;
        }
      } catch {
        // Keep waiting; progressive scoring may lag.
      }
    }
    return latest;
  },

  async completePracticeSession(sessionId: string): Promise<void> {
    await apiClient.post(learningEndpoints.completePracticeSession(sessionId), {});
  },

  async getRoadmapReport(roadmapId: string): Promise<RoadmapPracticeReport> {
    const response = await apiClient.get(learningEndpoints.roadmapReport(roadmapId));
    return mapRoadmapReport(response.data, roadmapId);
  },
};
