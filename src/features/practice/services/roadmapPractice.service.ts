import axios from 'axios';
import { apiClient } from '@/shared/api/apiClient';
import { getApiStatusCode } from '@/shared/api/apiError';
import { getPracticeSession as getB2cPracticeSession } from './b2cPracticeSession.service';
import { learningEndpoints } from './learning.endpoints';
import { multipartFormDataConfig } from '../utils/multipartFormDataConfig';
import type {
  PracticeAnswerDetail,
  PracticeSessionQuestionDto,
  PracticeSessionResponse,
  RoadmapLevelEvaluationItem,
  RoadmapPracticeReport,
  RoadmapProgressCriterionScore,
  RoadmapProgressPoint,
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

/**
 * Khác `pickNumber` ở đúng một điểm, và điểm đó là cả lý do nó tồn tại:
 * thiếu giá trị trả `null` chứ KHÔNG trả `0`.
 *
 * `0` và "không có số đo" là hai chuyện khác hẳn nhau. Dùng `pickNumber` cho
 * `startPercentage` sẽ biến "tiêu chí này mới có 1 buổi" thành "buổi đầu được 0%",
 * tức bịa ra một mốc xuất phát ở đáy rồi vẽ mọi thứ như đang tiến bộ vượt bậc.
 */
function pickNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
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

/**
 * `thresholdByName` — ngưỡng đạt của từng tiêu chí, lấy từ `levelEvaluation`.
 *
 * Backend KHÔNG gửi ngưỡng bên trong từng dòng radar: radar chỉ mang điểm đạt
 * (`percentage`), còn ngưỡng nằm ở mảng `levelEvaluation` cùng response, ghép theo TÊN tiêu chí.
 * Không ghép thì series "Mục tiêu" toàn 0 và biểu đồ vẽ một chấm ở tâm.
 */
function mapRadar(raw: unknown, thresholdByName: Map<string, number> = new Map()): RadarData[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const row = asRecord(item);
    const subject = pickString(row.subject, row.name, row.label, `Skill ${index + 1}`);
    return {
      subject,
      subjectVi: pickString(row.subjectVi, row.nameVi, row.labelVi) || subject,
      // `row.percentage` là tên field THẬT của backend (CriterionScoreResponse.Percentage).
      // Bốn tên trước đó chỉ tồn tại trong fixtures mock — chạy với dữ liệu thật thì mọi giá trị
      // rơi về 0, biểu đồ có đủ nhãn trục nhưng không vẽ gì. Đo trên deploy: một roadmap đã hoàn
      // thành với 40%/60%/70% vẫn hiện radar rỗng.
      A: pickNumber(row.A, row.current, row.value, row.score, row.percentage),
      B: pickNumber(row.B, row.target, row.goal) || thresholdByName.get(subject) || 0,
      fullMark: pickNumber(row.fullMark, 100) || 100,
      // Ba field dưới đây đọc ĐÚNG tên trong hợp đồng backend, không có nhánh đoán mò:
      // chuỗi fallback ở `A` phía trên chính là thứ từng khiến radar vẽ rỗng với dữ liệu
      // thật (mọi tên trước `percentage` chỉ tồn tại trong fixtures mock).
      C: pickNullableNumber(row.startPercentage),
      sessionCount: pickNumber(row.sessionCount),
      recentCount: pickNumber(row.recentCount),
    };
  });
}

function mapProgressScores(raw: unknown): RoadmapProgressCriterionScore[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const row = asRecord(entry);
      const name = pickString(row.name);
      if (!name) return null;
      return { name, percentage: pickNumber(row.percentage) };
    })
    .filter((item): item is RoadmapProgressCriterionScore => item != null);
}

/**
 * `order` quyết định thứ tự trên trục thời gian, nên sắp lại ở đây thay vì tin
 * thứ tự mảng: một buổi vẽ sai chỗ sẽ đảo ngược chính cái xu hướng đang cần đọc.
 */
function mapProgress(raw: unknown): RoadmapProgressPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry, index) => {
      const row = asRecord(entry);
      return {
        // `index + 1` là giá trị mặc định khi backend thiếu `order`, KHÔNG phải tên field đoán thêm.
        order: pickNumber(row.order, index + 1),
        lessonTitle: pickString(row.lessonTitle),
        completedAt:
          typeof row.completedAt === 'string' && row.completedAt.trim() ? row.completedAt : null,
        overallPercentage: pickNumber(row.overallPercentage),
        scores: mapProgressScores(row.scores),
      };
    })
    .sort((a, b) => a.order - b.order);
}

function mapLevelEvaluation(raw: unknown): RoadmapLevelEvaluationItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const row = asRecord(item);
      const criterionName = pickString(row.criterionName, row.name, row.label);
      if (!criterionName) return null;
      return {
        criterionName,
        percentage: pickNumber(row.percentage, row.score, row.value),
        levelThreshold: pickNumber(row.levelThreshold, row.threshold, row.target),
        passed: Boolean(row.passed ?? row.isPassed),
      };
    })
    .filter((item): item is RoadmapLevelEvaluationItem => item != null);
}

function mapRoadmapReport(raw: unknown, roadmapId: string): RoadmapPracticeReport {
  const item = asRecord(unwrapData(raw));
  const status = pickString(item.roadmapStatus, item.status).toLowerCase();
  const kindRaw = pickString(item.kind, item.reportKind, item.reportType).toLowerCase();
  let kind: RoadmapReportKind = 'interim';
  if (kindRaw === 'snapshot' || status === 'completed' || status === 'done') {
    kind = 'snapshot';
  }
  const levelEvalRaw = item.levelEvaluation;
  const levelEvaluation = Array.isArray(levelEvalRaw)
    ? mapLevelEvaluation(levelEvalRaw)
    : [];
  const levelEvaluationText = pickString(levelEvalRaw, item.level, item.evaluation);
  return {
    roadmapId: pickString(item.roadmapId, item.id) || roadmapId,
    kind,
    roadmapStatus: pickString(item.roadmapStatus, item.status) || undefined,
    levelEvaluation,
    levelEvaluationText: levelEvaluationText || undefined,
    levelEvaluationVi: pickString(item.levelEvaluationVi, item.levelVi, item.evaluationVi),
    overallComment: pickString(item.overallComment, item.comment, item.summary),
    overallCommentVi: pickString(item.overallCommentVi, item.commentVi, item.summaryVi),
    strengths: pickStringArray(item.strengths),
    strengthsVi: pickStringArray(item.strengthsVi),
    weaknesses: pickStringArray(item.weaknesses),
    weaknessesVi: pickStringArray(item.weaknessesVi),
    improvements: pickStringArray(item.improvements, item.tips),
    improvementsVi: pickStringArray(item.improvementsVi, item.tipsVi),
    radarData: mapRadar(
      item.radarData ?? item.radar ?? item.skills,
      new Map(levelEvaluation.map((e) => [e.criterionName, e.levelThreshold]))),
    progress: mapProgress(item.progress),
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

/**
 * Hai đường tạo buổi luyện cho một bài (start lần đầu / retry bài đã xong) trả
 * về CÙNG hợp đồng, nên dùng chung đúng một mapper + một bảng mã lỗi. Tách
 * nhánh riêng cho retry là cách hai đường trôi xa nhau mà không test nào đỏ.
 */
async function postLessonSession(url: string): Promise<StartLessonResult> {
  try {
    const response = await apiClient.post(url, {}, {
      validateStatus: (status) => status === 201 || (status >= 200 && status < 300),
    });
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
}

export const roadmapPracticeService = {
  maxAnswerBytes: MAX_ANSWER_BYTES,

  async startLesson(roadmapId: string, lessonId: string): Promise<StartLessonResult> {
    return postLessonSession(learningEndpoints.startLesson(roadmapId, lessonId));
  },

  /** Luyện LẠI bài đã hoàn thành — tiêu 1 credit, tạo buổi mới với câu hỏi khác. */
  async retryLesson(roadmapId: string, lessonId: string): Promise<StartLessonResult> {
    return postLessonSession(learningEndpoints.retryLesson(roadmapId, lessonId));
  },

  async getPracticeSession(sessionId: string): Promise<PracticeSessionResponse> {
    const session = await getB2cPracticeSession(sessionId);
    return {
      sessionId: session.id,
      id: session.id,
      title: undefined,
      status: session.status,
      currentQuestionIndex: undefined,
      questions: session.questions.map((item) => ({
        id: item.id,
        orderNo: item.orderNo,
        content: item.content,
        prompt: item.content,
        timeLimitSeconds: item.timeLimitSec,
        durationSec: item.timeLimitSec,
      })),
      result: session.result ?? undefined,
      answers: session.answers ?? undefined,
      jobCategory: session.jobCategory,
      cvId: session.cvId,
    };
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
      ...multipartFormDataConfig,
    });
    return mapAnswerDetail(response.data);
  },

  async getAnswer(sessionId: string, answerId: string): Promise<PracticeAnswerDetail> {
    const response = await apiClient.get(learningEndpoints.answer(sessionId, answerId));
    return mapAnswerDetail(response.data);
  },

  async waitForSessionQuestionFeedback(
    sessionId: string,
    questionId: string,
    options?: { attempts?: number; intervalMs?: number },
  ): Promise<PracticeAnswerDetail> {
    const attempts = options?.attempts ?? 12;
    const intervalMs = options?.intervalMs ?? 1500;

    const resolveFromSession = async (): Promise<PracticeAnswerDetail | null> => {
      const session = await getB2cPracticeSession(sessionId);
      const answers = session.answers ?? [];
      const match = answers.find((item) => item.questionId === questionId);
      if (!match) return null;
      const status = pickString(match.status);
      const hasScore = match.score != null;
      const scored = hasScore || isScoredStatus(status);
      if (!scored && !match.transcript && !match.comment) return null;
      return {
        answerId: pickString(match.answerId) || questionId,
        questionId,
        status: status || 'Pending',
        scoringStatus: status || undefined,
        score: match.score ?? undefined,
        feedback: pickString(match.comment),
        transcript: match.transcript ?? null,
      };
    };

    let latest = await resolveFromSession();
    if (latest && (latest.score != null || isScoredStatus(latest.status))) {
      return latest;
    }

    for (let i = 0; i < attempts; i += 1) {
      await sleep(intervalMs);
      latest = await resolveFromSession();
      if (latest && (latest.score != null || isScoredStatus(latest.status) || latest.feedback)) {
        return latest;
      }
    }

    if (latest) return latest;
    throw new Error('SESSION_FEEDBACK_TIMEOUT');
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

  async getRoadmapReport(roadmapId: string): Promise<RoadmapPracticeReport> {
    const response = await apiClient.get(learningEndpoints.roadmapReport(roadmapId));
    return mapRoadmapReport(response.data, roadmapId);
  },
};
