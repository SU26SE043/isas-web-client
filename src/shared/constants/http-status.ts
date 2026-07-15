/**
 * HTTP status codes used by the API client and error handling.
 * Uses `as const` (not `enum`) because `erasableSyntaxOnly` is enabled in tsconfig.
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];
