/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { HttpStatus } from '@/shared/constants/http-status';
import { getApiErrorMessage, getApiStatusCode, toApiError } from './apiError';

describe('apiError', () => {
  it('returns message from axios response body', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: HttpStatus.BAD_REQUEST,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: { message: 'Email already exists' },
      }
    );

    expect(getApiErrorMessage(error)).toBe('Email already exists');
    expect(getApiStatusCode(error)).toBe(HttpStatus.BAD_REQUEST);
  });

  it('falls back to error field or axios message', () => {
    const error = new axios.AxiosError(
      'Network Error',
      'ERR_NETWORK',
      undefined,
      undefined,
      {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as never,
        data: { error: 'Server unavailable' },
      }
    );

    expect(getApiErrorMessage(error)).toBe('Server unavailable');
  });

  it('returns plain string response bodies from axios', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: HttpStatus.BAD_REQUEST,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: 'Email already exists',
      }
    );

    expect(getApiErrorMessage(error)).toBe('Email already exists');
  });

  it('joins password validation arrays into a user-facing message', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: HttpStatus.BAD_REQUEST,
        statusText: 'Bad Request',
        headers: {},
        config: {} as never,
        data: ['Password is too short', { message: 'Password requires a number' }],
      },
    );

    expect(getApiErrorMessage(error)).toBe(
      'Password is too short. Password requires a number',
    );
  });

  it('falls back to getHttpErrorMessage when body and axios message are empty', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_RESPONSE',
      undefined,
      undefined,
      {
        status: HttpStatus.PAYMENT_REQUIRED,
        statusText: 'Payment Required',
        headers: {},
        config: {} as never,
        data: null,
      }
    );
    Object.defineProperty(error, 'message', { value: undefined });

    expect(getApiErrorMessage(error)).toBe(
      'Insufficient credits. Please purchase more credits.'
    );
  });

  it('preserves explicit i18n/custom fallback over status defaults', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_GATEWAY',
      undefined,
      undefined,
      {
        status: HttpStatus.BAD_GATEWAY,
        statusText: 'Bad Gateway',
        headers: {},
        config: {} as never,
        data: null,
      }
    );
    Object.defineProperty(error, 'message', { value: undefined });

    expect(getApiErrorMessage(error, 'Translated retry message')).toBe(
      'Translated retry message'
    );
  });

  it('returns guidance when the API server is unreachable', () => {
    const error = new axios.AxiosError('Network Error', 'ERR_NETWORK');

    expect(getApiErrorMessage(error, 'Fallback')).toContain('Cannot reach the API server');
  });

  it('returns fallback for non-axios errors', () => {
    expect(getApiErrorMessage(new Error('boom'), 'Fallback')).toBe('Fallback');
    expect(getApiStatusCode(new Error('boom'))).toBeUndefined();
  });

  it('normalizes axios errors via toApiError', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: HttpStatus.CONFLICT,
        statusText: 'Conflict',
        headers: {},
        config: {} as never,
        data: { message: 'Email taken', error: 'Conflict' },
      }
    );

    expect(toApiError(error)).toEqual({
      status: HttpStatus.CONFLICT,
      message: 'Email taken',
      error: 'Conflict',
    });
  });

  it('returns undefined from toApiError when status is missing', () => {
    expect(toApiError(new Error('boom'))).toBeUndefined();
    expect(toApiError(new axios.AxiosError('Network Error', 'ERR_NETWORK'))).toBeUndefined();
  });
});
