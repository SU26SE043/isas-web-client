/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import axios from 'axios';
import { parseAuthError, parseRegisterError } from './authErrors';

describe('parseRegisterError', () => {
  it('maps Email already exists to emailAlreadyExists', () => {
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
        data: 'Email already exists',
      },
    );

    expect(parseRegisterError(error, 'fallback')).toEqual({
      kind: 'emailAlreadyExists',
      message: 'Email already exists',
    });
  });

  it('maps 409 conflict to emailAlreadyExists', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: {} as never,
        data: { message: 'Email already exists' },
      },
    );

    expect(parseRegisterError(error, 'fallback').kind).toBe('emailAlreadyExists');
  });
});

describe('parseAuthError', () => {
  it('maps 401 Invalid credentials to invalidCredentials', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as never,
        data: 'Invalid credentials',
      },
    );

    expect(parseAuthError(error, 'fallback')).toEqual({
      kind: 'invalidCredentials',
      message: 'Invalid credentials',
    });
  });

  it('maps Account locked message to accountLocked', () => {
    const error = new axios.AxiosError(
      'Request failed',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config: {} as never,
        data: 'Account locked',
      },
    );

    expect(parseAuthError(error, 'fallback').kind).toBe('accountLocked');
  });
});
