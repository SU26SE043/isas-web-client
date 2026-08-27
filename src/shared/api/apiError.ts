import axios from 'axios';
import type { ApiError } from '@/shared/types/api-error';
import { getHttpErrorMessage } from '@/shared/utils/http-error';

export type { ApiError } from '@/shared/types/api-error';

type ApiErrorBody = Pick<ApiError, 'message' | 'error'>;

const DEFAULT_FALLBACK = 'Request failed';

const getValidationMessages = (data: unknown): string | undefined => {
  const messages: string[] = [];

  const collect = (value: unknown, field?: string) => {
    if (typeof value === 'string' && value.trim()) {
      messages.push(field ? `${field}: ${value.trim()}` : value.trim());
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => collect(item, field));
      return;
    }
    if (!value || typeof value !== 'object') return;

    const record = value as Record<string, unknown>;
    const errors = record.errors;
    if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
      Object.entries(errors).forEach(([errorField, fieldErrors]) => {
        collect(fieldErrors, errorField);
      });
    }
    if (!errors) {
      const message = record.message ?? record.error;
      if (typeof message === 'string') collect(message, field);
    }
  };

  collect(data);
  const uniqueMessages = Array.from(new Set(messages));
  return uniqueMessages.length ? uniqueMessages.join('. ') : undefined;
};

export const getApiErrorMessage = (error: unknown, fallback = DEFAULT_FALLBACK) => {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return fallback;
  }

  if ((error.code === 'ERR_NETWORK' || error.message === 'Network Error') && !error.response) {
    return 'Cannot reach the API server. Start Auth service (isas-server) and restart npm run dev.';
  }

  const status = error.response?.status;
  const resolvedFallback =
    status != null && fallback === DEFAULT_FALLBACK ? getHttpErrorMessage(status) : fallback;

  const responseData: unknown = error.response?.data;
  const validationMessage = getValidationMessages(responseData);
  if (validationMessage) {
    return validationMessage;
  }
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }
  if (responseData && typeof responseData === 'object') {
    const body = responseData as ApiErrorBody;
    return body.message ?? body.error ?? resolvedFallback;
  }
  return resolvedFallback;
};

export const getApiStatusCode = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
};

/** Normalize an Axios (or unknown) error into the shared ApiError shape when possible. */
export const toApiError = (error: unknown, fallback = DEFAULT_FALLBACK): ApiError | undefined => {
  const status = getApiStatusCode(error);
  if (status == null) {
    return undefined;
  }

  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return { status, message: getHttpErrorMessage(status) };
  }

  const responseData: unknown = error.response?.data;
  let message: string | undefined;
  let errorField: string | undefined;

  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
    const body = responseData as ApiErrorBody;
    errorField = body.error;
  }

  const validationMessage = getValidationMessages(responseData);
  if (validationMessage) {
    message = validationMessage;
  } else if (typeof responseData === 'string' && responseData.trim()) {
    message = responseData;
  } else if (responseData && typeof responseData === 'object') {
    const body = responseData as ApiErrorBody;
    message = body.message;
    errorField = body.error;
  }

  return {
    status,
    message: message ?? errorField ?? getApiErrorMessage(error, fallback),
    ...(errorField ? { error: errorField } : {}),
  };
};
