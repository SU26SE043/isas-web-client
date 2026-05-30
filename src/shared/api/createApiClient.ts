import axios from 'axios';
import { authTokenStorage } from './authTokenStorage';

const DEFAULT_API_BASE_URL = 'https://engine-spectrum-differential-book.trycloudflare.com';

export const createApiClient = () => {
  const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const accessToken = authTokenStorage.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  return client;
};
