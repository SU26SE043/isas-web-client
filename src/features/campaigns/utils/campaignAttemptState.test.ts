import { describe, expect, it } from 'vitest';
import type { CandidateCampaignDetailResponse } from '../types/campaignCandidate.types';
import {
  fillTemplate,
  isOutOfAttempts,
  readAttemptCounts,
  resolveCandidateAttemptView,
} from './campaignAttemptState';

/**
 * ATT1-F3 — bốn trạng thái lượt. Luật [C6] + "Nguyên tắc 3": hết lượt CHỈ từ attemptsUsed/maxAttempts,
 * KHÔNG suy từ interviewStatus (Backend hiện lượt bỏ ngang là NotStarted). Field vắng ⇒ logic trước ATT1.
 */
function detail(overrides: Partial<CandidateCampaignDetailResponse>): CandidateCampaignDetailResponse {
  return {
    campaignId: 'cmp-1',
    title: 'Backend Developer',
    criteria: [],
    membershipStatus: 'Joined',
    interviewStatus: 'NotStarted',
    started: false,
    sessionId: null,
    ...overrides,
  };
}

describe('resolveCandidateAttemptView — Backend cũ (field vắng) ⇒ y như trước ATT1', () => {
  it('chưa start ⇒ start (nút Bắt đầu vẫn có)', () => {
    expect(resolveCandidateAttemptView(detail({}))).toStrictEqual({ kind: 'start' });
  });

  it('started + sessionId ⇒ continue KHÔNG theo dõi lượt, kể cả khi interviewStatus là NotStarted', () => {
    expect(resolveCandidateAttemptView(detail({ started: true, sessionId: 's-1' }))).toStrictEqual({
      kind: 'continue',
      tracked: false,
    });
  });

  it('InProgress nhưng chưa có sessionId ⇒ start (đúng điều kiện canContinue cũ)', () => {
    expect(resolveCandidateAttemptView(detail({ interviewStatus: 'InProgress' }))).toStrictEqual({ kind: 'start' });
  });

  it('Completed ⇒ completed', () => {
    expect(resolveCandidateAttemptView(detail({ interviewStatus: 'Completed', started: true, sessionId: 's' })))
      .toStrictEqual({ kind: 'completed' });
  });

  it('chỉ có maxAttempts mà thiếu attemptsUsed ⇒ vẫn là Backend cũ (không ẩn nút)', () => {
    expect(resolveCandidateAttemptView(detail({ maxAttempts: 1 }))).toStrictEqual({ kind: 'start' });
    expect(resolveCandidateAttemptView(detail({ attemptsUsed: 1 }))).toStrictEqual({ kind: 'start' });
  });
});

describe('resolveCandidateAttemptView — bốn trạng thái khi có field ATT1', () => {
  it('① attemptsUsed 0 ⇒ start', () => {
    expect(resolveCandidateAttemptView(detail({ maxAttempts: 3, attemptsUsed: 0, lastAttemptAbandoned: false })))
      .toStrictEqual({ kind: 'start' });
  });

  it('② InProgress ⇒ continue có theo dõi, kể cả khi đang ở lượt cuối (used = max)', () => {
    expect(resolveCandidateAttemptView(detail({
      interviewStatus: 'InProgress', started: true, sessionId: 's', maxAttempts: 1, attemptsUsed: 1,
    }))).toStrictEqual({ kind: 'continue', tracked: true });
  });

  it.each([
    { used: 1, max: 3, lastAttemptNo: 1, attemptNo: 2, remaining: 2 },
    { used: 2, max: 3, lastAttemptNo: 2, attemptNo: 3, remaining: 1 },
  ])('③ bỏ ngang, còn lượt ($used/$max) ⇒ retry lượt $attemptNo — thắng cả started+sessionId cũ', ({ used, max, ...rest }) => {
    expect(resolveCandidateAttemptView(detail({
      interviewStatus: 'NotStarted', started: true, sessionId: 'old', maxAttempts: max, attemptsUsed: used, lastAttemptAbandoned: true,
    }))).toStrictEqual({ kind: 'retry', max, ...rest });
  });

  it('④ used = max, NotStarted ⇒ exhausted (không nút)', () => {
    expect(resolveCandidateAttemptView(detail({
      started: true, sessionId: 'old', maxAttempts: 2, attemptsUsed: 2, lastAttemptAbandoned: true,
    }))).toStrictEqual({ kind: 'exhausted', used: 2, max: 2 });
  });

  it('HR tăng số lần sau khi hết lượt ⇒ từ ④ quay về ③', () => {
    expect(resolveCandidateAttemptView(detail({ maxAttempts: 3, attemptsUsed: 2, lastAttemptAbandoned: true })).kind)
      .toBe('retry');
  });

  it('NotStarted + đã start mà KHÔNG có số ⇒ không bao giờ suy ra hết lượt từ interviewStatus', () => {
    expect(resolveCandidateAttemptView(detail({ started: true, sessionId: 'x', interviewStatus: 'NotStarted' })).kind)
      .not.toBe('exhausted');
  });
});

describe('readAttemptCounts / isOutOfAttempts', () => {
  it('đủ hai số ⇒ used / max / remaining', () => {
    expect(readAttemptCounts({ interviewStatus: 'NotStarted', maxAttempts: 3, attemptsUsed: 1 }))
      .toStrictEqual({ used: 1, max: 3, remaining: 2 });
  });

  it('thiếu một số ⇒ null', () => {
    expect(readAttemptCounts({ interviewStatus: 'NotStarted', maxAttempts: 3 })).toBeNull();
    expect(readAttemptCounts({ interviewStatus: 'NotStarted', attemptsUsed: 0 })).toBeNull();
  });

  it('hết lượt chỉ khi used ≥ max và không InProgress / Completed', () => {
    expect(isOutOfAttempts({ interviewStatus: 'NotStarted', maxAttempts: 2, attemptsUsed: 2 })).toBe(true);
    expect(isOutOfAttempts({ interviewStatus: 'NotStarted', maxAttempts: 2, attemptsUsed: 1 })).toBe(false);
    expect(isOutOfAttempts({ interviewStatus: 'InProgress', maxAttempts: 1, attemptsUsed: 1 })).toBe(false);
    expect(isOutOfAttempts({ interviewStatus: 'Completed', maxAttempts: 1, attemptsUsed: 1 })).toBe(false);
    expect(isOutOfAttempts({ interviewStatus: 'NotStarted' })).toBe(false);
  });
});

describe('fillTemplate', () => {
  it('thay mọi {key}', () => {
    expect(fillTemplate('Còn {remaining}/{max} lượt — {max}', { remaining: 2, max: 3 })).toBe('Còn 2/3 lượt — 3');
  });
});
