/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { getApiErrorMessage, getApiStatusCode } from './apiError';

describe('apiError', () => {
  it('returns message from axios response body', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: { message: 'Email already exists' },
      }
    );

    expect(getApiErrorMessage(error)).toBe('Email already exists');
    expect(getApiStatusCode(error)).toBe(400);
  });

  it('falls back to error field or axios message', () => {
    const error = new axios.AxiosError(
      'Network Error',
      'ERR_NETWORK',
      undefined,
      undefined,
      {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as never,
        data: { error: 'Server unavailable' },
      }
    );

    expect(getApiErrorMessage(error)).toBe('Server unavailable');
  });

  it('returns fallback for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('boom'), 'Fallback')).toBe('Fallback');
    expect(getApiStatusCode(new Error('boom'))).toBeUndefined();
  });
});
