import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Skip attaching Bearer (public endpoints such as refresh). */
    skipAuth?: boolean;
  }
}
