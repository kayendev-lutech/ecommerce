/**
 * ErrorCode enum defines standardized error codes for the application.
 * Each code maps to a specific error scenario.
 */
export enum ErrorCode {
  VALIDATION = 'ERR_001',
  DATABASE = 'ERR_002',
  AUTH = 'ERR_003',
  NOT_FOUND = 'ERR_004',
  UNKNOWN = 'ERR_005',
  CONFLICT = 'ERR_006',
  FORBIDDEN = 'ERR_007',
  UNAUTHORIZED = 'ERR_008',
  NOT_FOUND_RESOURCE = 'ERR_009',
  TOKEN_EXPIRED = 'ERR_010',
  PERMISSION_DENIED = 'ERR_011',
}
/**
 * ErrorDetails maps each ErrorCode to a human-readable message.
 * Used for consistent error responses throughout the application.
 */
export const ErrorDetails: Record<ErrorCode, { message: string }> = {
  [ErrorCode.VALIDATION]: { message: 'Validation error' },
  [ErrorCode.DATABASE]: { message: 'Database error' },
  [ErrorCode.AUTH]: { message: 'Authentication error' },
  [ErrorCode.NOT_FOUND]: { message: 'Not found' },
  [ErrorCode.UNKNOWN]: { message: 'Unknown error' },
  [ErrorCode.CONFLICT]: { message: 'Conflict' },
  [ErrorCode.FORBIDDEN]: { message: 'Forbidden' },
  [ErrorCode.UNAUTHORIZED]: { message: 'Unauthorized' },
  [ErrorCode.NOT_FOUND_RESOURCE]: { message: 'Resource not found' },
  [ErrorCode.TOKEN_EXPIRED]: { message: 'Token expired' },
  [ErrorCode.PERMISSION_DENIED]: { message: 'Permission denied' },
};
