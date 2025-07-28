import { ErrorCode, ErrorDetails } from '@errors/error-code';

export class AppError extends Error {
  public success: boolean;
  public statusCode: number;
  public code: ErrorCode;
  public details?: any;

  constructor(code: ErrorCode, statusCode = 400, details?: any) {
    const { message } = ErrorDetails[code] || {
      message: 'Unknown error',
    };
    super(message);

    this.success = false;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestException extends AppError {
  constructor(details?: any) {
    super(ErrorCode.VALIDATION, 400, details);
  }
}

export class UnauthorizedException extends AppError {
  constructor(details?: any) {
    super(ErrorCode.UNAUTHORIZED, 401, details);
  }
}

export class ForbiddenException extends AppError {
  constructor(details?: any) {
    super(ErrorCode.FORBIDDEN, 403, details);
  }
}

export class ConflictException extends AppError {
  constructor(details?: any) {
    super(ErrorCode.CONFLICT, 409, details);
  }
}

export class NotFoundException extends AppError {
  constructor(details?: any) {
    super(ErrorCode.NOT_FOUND, 404, details);
  }
}

export class InternalServerErrorException extends AppError {
  constructor(details?: any) {
    super(ErrorCode.UNKNOWN, 500, details);
  }
}
export { ErrorCode };
