/* @vitest-environment node */
import { describe, expect, it } from 'vitest';
import { HttpStatus } from '@/shared/constants/http-status';
import { getHttpErrorMessage } from './http-error';

describe('getHttpErrorMessage', () => {
  it('maps known statuses to English fallbacks', () => {
    expect(getHttpErrorMessage(HttpStatus.BAD_REQUEST)).toBe('Invalid request data.');
    expect(getHttpErrorMessage(HttpStatus.UNAUTHORIZED)).toBe(
      'Your session has expired. Please login again.'
    );
    expect(getHttpErrorMessage(HttpStatus.PAYMENT_REQUIRED)).toBe(
      'Insufficient credits. Please purchase more credits.'
    );
    expect(getHttpErrorMessage(HttpStatus.FORBIDDEN)).toBe(
      "You don't have permission to perform this action."
    );
    expect(getHttpErrorMessage(HttpStatus.NOT_FOUND)).toBe('Resource not found.');
    expect(getHttpErrorMessage(HttpStatus.CONFLICT)).toBe('Resource conflict.');
    expect(getHttpErrorMessage(HttpStatus.GONE)).toBe('This resource has expired.');
    expect(getHttpErrorMessage(HttpStatus.INTERNAL_SERVER_ERROR)).toBe('Internal server error.');
    expect(getHttpErrorMessage(HttpStatus.BAD_GATEWAY)).toBe(
      'Dependent service is unavailable.'
    );
  });

  it('returns a generic message for unknown statuses', () => {
    expect(getHttpErrorMessage(418)).toBe('Unexpected error.');
  });
});
