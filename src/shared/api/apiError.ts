import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const getApiErrorMessage = (error: unknown, fallback = 'Request failed') => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallback;
  }

  const responseData = error.response?.data;
  return responseData?.message ?? responseData?.error ?? error.message ?? fallback;
};

export const getApiStatusCode = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return undefined;
  }

  return error.response?.status;
};
