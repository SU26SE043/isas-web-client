import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { getInvitationApiErrorMessage } from './invitationApiError';

describe('invitationApiError', () => {
  it('preserves the server text for a start-now 409', () => {
    const error = new axios.AxiosError('Request failed');
    error.response = {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: {} as never,
      data: 'Campaign có khung giờ phỏng vấn (ca thi) — sửa từng ca.',
    };

    expect(getInvitationApiErrorMessage(error, 'fallback')).toBe(
      'Campaign có khung giờ phỏng vấn (ca thi) — sửa từng ca.',
    );
  });
});
