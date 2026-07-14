/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { parseAuthTokens, unwrapAuthPayload } from '@/shared/api/authPayload';
import { parseRegisterResponse, parseUser, UserRole } from './auth.types';

describe('unwrapAuthPayload', () => {
  it('returns raw DTO when no wrapper', () => {
    const raw = { accessToken: 'a', refreshToken: 'r' };
    expect(unwrapAuthPayload(raw)).toEqual(raw);
  });

  it('unwraps ApiResponse.data when outer has no DTO keys', () => {
    expect(unwrapAuthPayload({ data: { id: '1', email: 'a@b.c' }, success: true })).toEqual({
      id: '1',
      email: 'a@b.c',
    });
  });
});

describe('parseAuthTokens', () => {
  it('parses Auth service login body', () => {
    expect(
      parseAuthTokens({
        accessToken: 'access',
        refreshToken: 'refresh',
        expiresAt: '2026-07-14T15:00:00Z',
      }),
    ).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('parses wrapped token body', () => {
    expect(
      parseAuthTokens({
        data: { accessToken: 'access', refreshToken: 'refresh' },
      }),
    ).toMatchObject({ accessToken: 'access', refreshToken: 'refresh' });
  });
});

describe('parseRegisterResponse', () => {
  it('parses legacy plain-string register result', () => {
    expect(parseRegisterResponse('User ID: abc-123', 'x@y.z')).toEqual({
      id: 'abc-123',
      email: 'x@y.z',
    });
  });
});

describe('parseUser', () => {
  it('normalizes Candidate role and null profile fields', () => {
    expect(
      parseUser({
        id: '1',
        fullName: 'Test',
        email: 't@isas.dev',
        location: null,
        title: null,
        createdAt: '2026-07-14T00:00:00Z',
        role: 'Candidate',
      }),
    ).toEqual({
      id: '1',
      fullName: 'Test',
      email: 't@isas.dev',
      location: '',
      title: '',
      createdAt: '2026-07-14T00:00:00Z',
      role: UserRole.CANDIDATE,
    });
  });
});
