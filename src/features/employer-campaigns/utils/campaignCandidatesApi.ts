import type {
  CampaignCandidateDetail,
  CampaignCandidateListItem,
  CandidateEvidence,
  CampaignResultFlag,
  CampaignResultStatus,
  CampaignResultsResponse,
  CampaignScoredResult,
  CampaignTranscriptResponse,
  CampaignUnscoredFlaggedResult,
  CandidateListQuery,
  CandidateUploadResponse,
  InviteCampaignCandidatesResponse,
} from '../types/campaign.api.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return undefined;
}

function pickString(record: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) return value;
  }
  return undefined;
}

function pickNumber(record: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const value = asNumber(record[key]);
    if (value != null) return value;
  }
  return undefined;
}

function parseEvidence(raw: unknown): CandidateEvidence[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    const record = asRecord(item);
    if (!record) return [];
    const needId = pickString(record, 'needId', 'NeedId') ?? '';
    const area = pickString(record, 'area', 'Area') ?? '';
    const evidence = pickString(record, 'evidence', 'Evidence') ?? '';
    if (!needId || !area || !evidence) return [];
    return [{ needId, area, level: pickString(record, 'level', 'Level') ?? 'Weak', evidence }];
  });
}

function parseStringArray(raw: unknown): string[] {
  return Array.isArray(raw) ? raw.filter((item): item is string => typeof item === 'string') : [];
}

/** Drop empty query values before GET /candidates. */
export function buildCandidateListParams(
  query?: CandidateListQuery,
): Record<string, string | number> | undefined {
  if (!query) return undefined;
  const params: Record<string, string | number> = {};
  if (query.status?.trim()) params.status = query.status.trim();
  if (query.minScore != null && Number.isFinite(query.minScore)) params.minScore = query.minScore;
  if (query.skill?.trim()) params.skill = query.skill.trim();
  if (query.sort === 'score' || query.sort === 'name') params.sort = query.sort;
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.cursor?.trim()) params.cursor = query.cursor.trim();
  if (query.limit != null && Number.isFinite(query.limit)) {
    params.limit = Math.min(500, Math.max(1, Math.trunc(query.limit)));
  }
  return Object.keys(params).length > 0 ? params : undefined;
}

export function unwrapArrayPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  const root = asRecord(data);
  if (!root) return [];
  if (Array.isArray(root.data)) return root.data;
  if (Array.isArray(root.items)) return root.items;
  if (Array.isArray(root.candidates)) return root.candidates;
  if (Array.isArray(root.results)) return root.results;
  const nested = asRecord(root.data);
  if (nested) {
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.candidates)) return nested.candidates;
    if (Array.isArray(nested.results)) return nested.results;
  }
  return [];
}

export function parseCandidateListItem(raw: unknown): CampaignCandidateListItem | null {
  const record = asRecord(raw);
  if (!record) return null;
  const id = pickString(record, 'id', 'Id');
  if (!id) return null;
  const skillsRaw = record.skills ?? record.Skills;
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw.filter((item): item is string => typeof item === 'string')
    : null;
  return {
    id,
    fullName: pickString(record, 'fullName', 'FullName') ?? null,
    email: pickString(record, 'email', 'Email') ?? null,
    status: pickString(record, 'status', 'Status') ?? 'Unknown',
    overallMatchScore: pickNumber(record, 'overallMatchScore', 'OverallMatchScore') ?? null,
    skills,
    verificationRisk: (pickString(record, 'verificationRisk', 'VerificationRisk') as CampaignCandidateListItem['verificationRisk']) ?? null,
    screeningVersion: pickNumber(record, 'screeningVersion', 'ScreeningVersion') ?? null,
  };
}

export function parseCandidateUploadResponse(data: unknown): CandidateUploadResponse {
  const root = asRecord(data);
  const body = asRecord(root?.data) ?? root ?? {};
  const list = unwrapArrayPayload(body.candidates ?? body.Candidates ?? []);
  return {
    received: pickNumber(body, 'received', 'Received') ?? 0,
    rejected: pickNumber(body, 'rejected', 'Rejected') ?? 0,
    filtered: pickNumber(body, 'filtered', 'Filtered') ?? 0,
    skipped: pickNumber(body, 'skipped', 'Skipped') ?? 0,
    candidates: list
      .map((item) => {
        const record = asRecord(item);
        if (!record) return null;
        const id = pickString(record, 'id', 'Id');
        if (!id) return null;
        return {
          id,
          fullName: pickString(record, 'fullName', 'FullName') ?? null,
          email: pickString(record, 'email', 'Email') ?? null,
          status: pickString(record, 'status', 'Status') ?? 'Filtered',
          rejectReason: pickString(record, 'rejectReason', 'RejectReason') ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item != null),
  };
}

export function parseCandidateDetail(data: unknown): CampaignCandidateDetail | null {
  const root = asRecord(data);
  const body = asRecord(root?.data) ?? root;
  if (!body) return null;
  const id = pickString(body, 'id', 'Id');
  if (!id) return null;

  const skillsRaw = body.skills ?? body.Skills;
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw.filter((item): item is string => typeof item === 'string')
    : null;

  return {
    id,
    fullName: pickString(body, 'fullName', 'FullName') ?? null,
    email: pickString(body, 'email', 'Email') ?? null,
    status: pickString(body, 'status', 'Status') ?? 'Unknown',
    overallMatchScore: pickNumber(body, 'overallMatchScore', 'OverallMatchScore') ?? null,
    skills,
    yearsExperience: pickNumber(body, 'yearsExperience', 'YearsExperience') ?? null,
    summary: pickString(body, 'summary', 'Summary') ?? null,
    rejectReason: pickString(body, 'rejectReason', 'RejectReason') ?? null,
    cvFileUrl: pickString(body, 'cvFileUrl', 'CvFileUrl') ?? null,
    screeningVersion: pickNumber(body, 'screeningVersion', 'ScreeningVersion') ?? null,
    fitSummary: pickString(body, 'fitSummary', 'FitSummary') ?? null,
    strengths: parseEvidence(body.strengths ?? body.Strengths),
    gaps: parseEvidence(body.gaps ?? body.Gaps),
    bonusSignals: parseStringArray(body.bonusSignals ?? body.BonusSignals),
    verificationRisk: (pickString(body, 'verificationRisk', 'VerificationRisk') as CampaignCandidateDetail['verificationRisk']) ?? null,
    verifyQuestions: parseStringArray(body.verifyQuestions ?? body.VerifyQuestions),
  };
}

export function parseInviteByCandidateIdsResponse(
  data: unknown,
): InviteCampaignCandidatesResponse {
  const root = asRecord(data);
  const body = asRecord(root?.data) ?? root ?? {};
  const invitedRaw = Array.isArray(body.invited)
    ? body.invited
    : Array.isArray(body.Invited)
      ? body.Invited
      : [];
  const failedRaw = Array.isArray(body.failed)
    ? body.failed
    : Array.isArray(body.Failed)
      ? body.Failed
      : [];

  const invited = invitedRaw
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const candidateId = pickString(record, 'candidateId', 'CandidateId');
      const invitationId = pickString(record, 'invitationId', 'InvitationId');
      const email = pickString(record, 'email', 'Email');
      if (!candidateId || !invitationId || !email) return null;
      return { candidateId, invitationId, email };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  const failed = failedRaw
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const candidateId = pickString(record, 'candidateId', 'CandidateId');
      const reason = pickString(record, 'reason', 'Reason') ?? 'Failed';
      if (!candidateId) return null;
      return { candidateId, reason };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  return { invited, failed };
}

function parseCampaignResultFlags(raw: unknown): CampaignResultFlag[] {
  if (!Array.isArray(raw)) return [];
  const flags: CampaignResultFlag[] = [];
  for (const flag of raw) {
    const flagRecord = asRecord(flag);
    if (!flagRecord) continue;
    const type = pickString(flagRecord, 'type', 'Type');
    const count = pickNumber(flagRecord, 'count', 'Count') ?? 0;
    if (!type) continue;
    const source = pickString(flagRecord, 'source', 'Source');
    flags.push({
      type,
      count,
      note: pickString(flagRecord, 'note', 'Note') ?? null,
      source: source === 'Server' ? 'Server' : 'Client',
    });
  }
  return flags;
}

function parseUnscoredFlaggedResult(raw: unknown): CampaignUnscoredFlaggedResult | null {
  const record = asRecord(raw);
  if (!record) return null;
  const candidateId = pickString(record, 'candidateId', 'CandidateId');
  const sessionId = pickString(record, 'sessionId', 'SessionId');
  if (!candidateId || !sessionId) return null;
  return {
    candidateId,
    sessionId,
    fullName: pickString(record, 'fullName', 'FullName') ?? null,
    email: pickString(record, 'email', 'Email') ?? null,
    flags: parseCampaignResultFlags(record.flags ?? record.Flags),
  };
}

export function parseCampaignResultsResponse(data: unknown): CampaignResultsResponse {
  const root = asRecord(data);
  const body = asRecord(root?.data) ?? root ?? {};
  const passScorePct = pickNumber(body, 'passScorePct', 'PassScorePct') ?? null;
  const resultsRaw = unwrapArrayPayload(body.results ?? body.Results ?? body);
  const results = resultsRaw
    .map((item): CampaignScoredResult | null => {
      const record = asRecord(item);
      if (!record) return null;
      const candidateId = pickString(record, 'candidateId', 'CandidateId');
      const sessionId = pickString(record, 'sessionId', 'SessionId');
      const scoredAt = pickString(record, 'scoredAt', 'ScoredAt');
      if (!candidateId || !sessionId || !scoredAt) return null;
      const resultRaw = pickString(record, 'result', 'Result');
      let result: CampaignResultStatus =
        resultRaw === 'Pass' || resultRaw === 'Fail' ? resultRaw : null;
      const overrideResultRaw = pickString(record, 'overrideResult', 'OverrideResult');
      const overrideResult: CampaignResultStatus =
        overrideResultRaw === 'Pass' || overrideResultRaw === 'Fail' ? overrideResultRaw : null;
      const totalScore = pickNumber(record, 'totalScore', 'TotalScore') ?? 0;
      if (result == null && passScorePct != null) {
        result = totalScore >= passScorePct ? 'Pass' : 'Fail';
      }
      return {
        rank: pickNumber(record, 'rank', 'Rank') ?? 0,
        candidateId,
        sessionId,
        fullName: pickString(record, 'fullName', 'FullName') ?? null,
        email: pickString(record, 'email', 'Email') ?? null,
        totalScore,
        aiScore: pickNumber(record, 'aiScore', 'AiScore') ?? 0,
        overrideScore: pickNumber(record, 'overrideScore', 'OverrideScore') ?? null,
        overrideResult,
        overrideNote: pickString(record, 'overrideNote', 'OverrideNote') ?? null,
        overriddenAt: pickString(record, 'overriddenAt', 'OverriddenAt') ?? null,
        result,
        scoredAt,
        flags: parseCampaignResultFlags(record.flags ?? record.Flags),
      };
    })
    .filter((item): item is CampaignScoredResult => item != null);

  const unscoredRaw = body.unscoredFlagged ?? body.UnscoredFlagged;
  const unscoredFlagged = Array.isArray(unscoredRaw)
    ? unscoredRaw
        .map(parseUnscoredFlaggedResult)
        .filter((item): item is CampaignUnscoredFlaggedResult => item != null)
    : [];

  return {
    campaignId: pickString(body, 'campaignId', 'CampaignId') ?? '',
    passScorePct,
    totalCandidates: pickNumber(body, 'totalCandidates', 'TotalCandidates') ?? results.length,
    results,
    unscoredFlagged,
  };
}

export function parseCampaignTranscriptResponse(data: unknown): CampaignTranscriptResponse {
  const root = asRecord(data);
  const body = asRecord(root?.data) ?? root ?? {};
  const sessionId = pickString(body, 'sessionId', 'SessionId') ?? '';
  const questionsRaw = unwrapArrayPayload(body.questions ?? body.Questions);
  const questions = questionsRaw
    .map((item) => {
      const record = asRecord(item);
      if (!record) return null;
      const questionId = pickString(record, 'questionId', 'QuestionId');
      const content = pickString(record, 'content', 'Content');
      if (!questionId || !content) return null;
      const scoresRaw = record.scores ?? record.Scores;
      const scores = Array.isArray(scoresRaw)
        ? scoresRaw
            .map((scoreItem) => {
              const scoreRecord = asRecord(scoreItem);
              if (!scoreRecord) return null;
              const criterionId = pickString(scoreRecord, 'criterionId', 'CriterionId');
              const score = pickNumber(scoreRecord, 'score', 'Score');
              if (!criterionId || score == null) return null;
              return {
                criterionId,
                criterionName: pickString(scoreRecord, 'criterionName', 'CriterionName') ?? null,
                score,
                maxScore: pickNumber(scoreRecord, 'maxScore', 'MaxScore') ?? null,
                reasoning: pickString(scoreRecord, 'reasoning', 'Reasoning') ?? null,
              };
            })
            .filter((score): score is NonNullable<typeof score> => score != null)
        : [];
      return {
        questionId,
        orderNo: pickNumber(record, 'orderNo', 'OrderNo') ?? 0,
        content,
        transcript: pickString(record, 'transcript', 'Transcript') ?? null,
        needsReview: Boolean(record.needsReview ?? record.NeedsReview),
        scores,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null)
    .sort((a, b) => a.orderNo - b.orderNo);

  return { sessionId, questions };
}

/** Only treat absolute http(s) URLs as safe download links. */
export function isAbsoluteHttpUrl(value: string | null | undefined): boolean {
  if (!value?.trim()) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
