import axios from 'axios';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api';
import { HttpStatus } from '@/shared/constants/http-status';
import type { ApiError } from '@/shared/types/api-error';

export type AuthErrorKind =
  | 'invalidCredentials'
  | 'accountLocked'
  | 'accountBanned'
  | 'emailAlreadyExists'
  | 'mfaRequired'
  | 'generic';

interface ApiErrorBody extends Pick<ApiError, 'message' | 'error'> {
  code?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface ParsedAuthError {
  kind: AuthErrorKind;
  message: string;
  mfaToken?: string;
}

/** HTTP 423 Locked — not in shared HttpStatus (auth-only). */
const HTTP_LOCKED = 423;

function isLockedMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('lock') || lower.includes('blocked') || lower.includes('too many');
}

function isEmailAlreadyExistsMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('email already') || lower.includes('already exists');
}

export function parseRegisterError(error: unknown, fallback: string): ParsedAuthError {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error, fallback);

  if (
    status === HttpStatus.CONFLICT ||
    (status === HttpStatus.BAD_REQUEST && isEmailAlreadyExistsMessage(message))
  ) {
    return { kind: 'emailAlreadyExists', message };
  }

  return { kind: 'generic', message };
}

export function parseAuthError(error: unknown, fallback: string): ParsedAuthError {
  const status = getApiStatusCode(error);
  const message = getApiErrorMessage(error, fallback);

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    if (data?.mfaRequired || data?.code === 'MFA_REQUIRED') {
      return { kind: 'mfaRequired', message, mfaToken: data.mfaToken };
    }
  }

  if (status === HTTP_LOCKED || (status === HttpStatus.FORBIDDEN && isLockedMessage(message))) {
    return { kind: 'accountLocked', message };
  }

  if (status === HttpStatus.FORBIDDEN) {
    return { kind: 'accountBanned', message };
  }

  if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.BAD_REQUEST) {
    if (isLockedMessage(message)) {
      return { kind: 'accountLocked', message };
    }
    return { kind: 'invalidCredentials', message };
  }

  return { kind: 'generic', message };
}
