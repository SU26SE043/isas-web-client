import axios from 'axios';
import { getApiErrorMessage, getApiStatusCode } from '@/shared/api';

export type AuthErrorKind = 'invalidCredentials' | 'accountLocked' | 'mfaRequired' | 'generic';

interface ApiErrorBody {
  message?: string;
  error?: string;
  code?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface ParsedAuthError {
  kind: AuthErrorKind;
  message: string;
  mfaToken?: string;
}

function isLockedMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes('lock') || lower.includes('blocked') || lower.includes('too many');
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

  if (status === 423 || (status === 403 && isLockedMessage(message))) {
    return { kind: 'accountLocked', message };
  }

  if (status === 401 || status === 400) {
    if (isLockedMessage(message)) {
      return { kind: 'accountLocked', message };
    }
    return { kind: 'invalidCredentials', message };
  }

  return { kind: 'generic', message };
}
