/** Let the browser set multipart boundary — do not send application/json Content-Type. */
export const multipartFormDataConfig = {
  transformRequest: [
    (data: unknown, headers?: Record<string, unknown>) => {
      if (data instanceof FormData && headers) {
        if ('delete' in headers && typeof (headers as { delete: (key: string) => void }).delete === 'function') {
          (headers as { delete: (key: string) => void }).delete('Content-Type');
        } else {
          delete headers['Content-Type'];
        }
      }
      return data;
    },
  ],
};
