import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const getApiErrorMessage = (error: unknown, fallback = 'Request failed') => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  if ((error.code === 'ERR_NETWORK' || error.message === 'Network Error') && !error.response) {
    return 'Cannot reach the API server. Start Auth service (isas-server) and restart npm run dev.';
  }

  const responseData: unknown = error.response?.data;
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }
  if (responseData && typeof responseData === 'object') {
    const body = responseData as ApiErrorResponse;
    return body.message ?? body.error ?? error.message ?? fallback;
  }
  return error.message ?? fallback;
};

export const getApiStatusCode = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
};
