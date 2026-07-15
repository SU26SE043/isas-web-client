import axios from 'axios';
import type { ApiError } from '@/shared/types/api-error';
import { getHttpErrorMessage } from '@/shared/utils/http-error';

export type { ApiError } from '@/shared/types/api-error';

type ApiErrorBody = Pick<ApiError, 'message' | 'error'>;

const DEFAULT_FALLBACK = 'Request failed';

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
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }
  if (responseData && typeof responseData === 'object') {
    const body = responseData as ApiErrorBody;
    return body.message ?? body.error ?? error.message ?? resolvedFallback;
  }
  return error.message ?? resolvedFallback;
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

  if (typeof responseData === 'string' && responseData.trim()) {
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
