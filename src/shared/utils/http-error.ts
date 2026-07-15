import { HttpStatus } from '@/shared/constants/http-status';

export function getHttpErrorMessage(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'Invalid request data.';
    case HttpStatus.UNAUTHORIZED:
      return 'Your session has expired. Please login again.';
    case HttpStatus.PAYMENT_REQUIRED:
      return 'Insufficient credits. Please purchase more credits.';
    case HttpStatus.FORBIDDEN:
      return "You don't have permission to perform this action.";
    case HttpStatus.NOT_FOUND:
      return 'Resource not found.';
    case HttpStatus.CONFLICT:
      return 'Resource conflict.';
    case HttpStatus.GONE:
      return 'This resource has expired.';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'Internal server error.';
    case HttpStatus.BAD_GATEWAY:
      return 'Dependent service is unavailable.';
    default:
      return 'Unexpected error.';
  }
}
