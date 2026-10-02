import { describe, expect, it } from 'vitest';
import { CampaignCandidateError } from '../services/campaignCandidate.service';
import { isAttemptLimitReached, startErrorMessage } from './campaignStartError';

const t = (key: string) => `t:${key}`;

describe('startErrorMessage — ATT1 [C8]', () => {
  it('attemptLimitReached ⇒ câu riêng, KHÔNG phải lời server của 409', () => {
    const error = new CampaignCandidateError('attemptLimitReached', 'Server: hết lượt', 409, { apiCode: 'ATTEMPT_LIMIT_REACHED' });
    expect(startErrorMessage(error, t)).toBe('t:campaigns.detail.startAttemptLimitReached');
    expect(isAttemptLimitReached(error)).toBe(true);
  });

  it('409 khác vẫn hiện lời server như trước', () => {
    const error = new CampaignCandidateError('conflict', 'Xung đột trạng thái', 409);
    expect(startErrorMessage(error, t)).toBe('Xung đột trạng thái');
    expect(isAttemptLimitReached(error)).toBe(false);
  });

  it('lỗi không phải CampaignCandidateError ⇒ câu chung', () => {
    expect(startErrorMessage(new Error('x'), t)).toBe('t:campaigns.detail.startUnknown');
    expect(isAttemptLimitReached(new Error('x'))).toBe(false);
  });
});
