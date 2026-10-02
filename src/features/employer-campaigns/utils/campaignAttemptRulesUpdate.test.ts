import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  buildIncreaseMaxAttemptsRequest,
  canIncreaseMaxAttempts,
  getMaxAttemptsUpdateServerMessage,
  increaseMaxAttemptsOptions,
} from './campaignAttemptRulesUpdate';

function httpError(status: number, data: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  });
}

describe('increaseMaxAttemptsOptions — [C2] Active chỉ được TĂNG', () => {
  it.each([
    [1, [2, 3]],
    [2, [3]],
    [3, []],
  ])('đang %i ⇒ chỉ liệt kê %j (KHÔNG có giá trị ≤ hiện tại)', (current, expected) => {
    expect(increaseMaxAttemptsOptions(current)).toEqual(expected);
  });
});

describe('canIncreaseMaxAttempts — nút "Tăng số lần" chỉ khi Active và còn < 3', () => {
  it.each([
    ['active', 1, true],
    ['active', 2, true],
    ['active', 3, false],
    ['draft', 1, false],
    ['closed', 1, false],
    ['archived', 1, false],
    ['paused', 1, false],
  ] as const)('%s · đang %i ⇒ %s', (status, current, expected) => {
    expect(canIncreaseMaxAttempts(status, current)).toBe(expected);
  });
});

describe('buildIncreaseMaxAttemptsRequest — body PUT ĐÚNG { title, maxAttempts }', () => {
  it('có title (Backend bắt buộc) và maxAttempts, KHÔNG thêm khoá nào khác', () => {
    const body = buildIncreaseMaxAttemptsRequest('Backend Developer', 3);
    expect(body).toStrictEqual({ title: 'Backend Developer', maxAttempts: 3 });
    expect(Object.keys(body).sort()).toEqual(['maxAttempts', 'title']);
  });
});

describe('getMaxAttemptsUpdateServerMessage — 409 ⇒ lời server nguyên văn', () => {
  it.each(['MAX_ATTEMPTS_DECREASE', 'TIME_LIMIT_LOCKED'])('409 code %s ⇒ trả NGUYÊN `error` của server', (code) => {
    const error = httpError(409, { code, error: 'Không thể giảm số lần làm bài (đang 2).' });
    expect(getMaxAttemptsUpdateServerMessage(error)).toBe('Không thể giảm số lần làm bài (đang 2).');
  });

  it('body bọc trong `data` vẫn đọc được code + error', () => {
    const error = httpError(409, { data: { code: 'TIME_LIMIT_LOCKED', error: 'Thời lượng đã khoá.' } });
    expect(getMaxAttemptsUpdateServerMessage(error)).toBe('Thời lượng đã khoá.');
  });

  it('code đã biết đi kèm status khác 409 (gateway đổi mã) ⇒ vẫn đọc theo `code`, trả lời server', () => {
    const error = httpError(400, { code: 'MAX_ATTEMPTS_DECREASE', error: 'Chỉ được tăng số lần làm bài.' });
    expect(getMaxAttemptsUpdateServerMessage(error)).toBe('Chỉ được tăng số lần làm bài.');
  });

  it('409 không có code nhưng có error (Closed/Archived [C2]) ⇒ vẫn là lời server', () => {
    expect(getMaxAttemptsUpdateServerMessage(httpError(409, { error: 'Chiến dịch đã đóng.' }))).toBe('Chiến dịch đã đóng.');
  });

  it.each([
    ['500 có error', httpError(500, { error: 'NullReferenceException at …' })],
    ['409 không có error', httpError(409, { code: 'MAX_ATTEMPTS_DECREASE' })],
    ['409 error rỗng', httpError(409, { code: 'MAX_ATTEMPTS_DECREASE', error: '   ' })],
    ['lỗi không phải HTTP', new Error('boom')],
  ])('%s ⇒ null (caller dùng câu i18n chung)', (_label, error) => {
    expect(getMaxAttemptsUpdateServerMessage(error)).toBeNull();
  });
});
