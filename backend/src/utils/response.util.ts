import { Response } from 'express';

interface SuccessResponse<T = any> {
  status?: number;
  data?: T;
  pagination?: any;
  message?: string;
}

interface ErrorResponse {
  statusCode?: number;
  error?: {
    description?: string;
  };
  message?: string;
  status?: number;
}
/**
 * Sends a standardized success response to the client.
 * Handles both SuccessResponse objects and plain data.
 * @param res Express response object
 * @param result SuccessResponse or plain data
 */
function handleSuccess<T>(res: Response, result: SuccessResponse<T> | T) {
  let responseData: SuccessResponse<T>;
  const defaultMessage = 'Operation successful';

  if (typeof result === 'object' && result !== null && (result as SuccessResponse<T>)?.status) {
    const {
      status = 200,
      data,
      message = defaultMessage,
      pagination,
    } = result as SuccessResponse<T>;

    responseData = result;

    res.status(status).json(responseData);
  } else {
    responseData = {
      status: 200,
      message: defaultMessage,
      data: (result as any)?.data as unknown as T,
      pagination: (result as any)?.pagination,
    };

    res.status(responseData?.status || 200).json({ success: true, ...responseData });
  }
}

function handleError(res: Response, error: ErrorResponse | string | any) {
  let errorMessage: string = 'An unknown error occurred';
  let errorStatus: number = 500;
  let errorObj: any = {};

  // Handle structured error with statusCode and error object
  if (error.statusCode && error.error) {
    errorStatus = error.statusCode;
    errorMessage = error.error.description || 'An error occurred';
    errorObj = error.error;
  }
  // Handle AppError instance
  else if (error instanceof Error && 'statusCode' in error && 'code' in error) {
    errorStatus = Number(error.statusCode) || 500;
    errorMessage = error.message;
    errorObj = {
      statusCode: error.statusCode,
      code: error.code,
      details: (error as any)?.details?.toString(),
    };
  }
  // Handle general errors with code property
  else if (error.code) {
    errorStatus = 400;
    errorMessage = error.errmsg || 'A database error occurred';
    errorObj = {
      code: error.code,
      details: error.errmsg,
    };
  }
  // Handle class validation errors
  else if (error.errors) {
    errorStatus = 400;
    errorMessage =
      error.errors.map((err: { message: string }) => err.message).join(', ') || 'Validation failed';
    errorObj = error.errors;
  }
  // Handle string errors
  else if (typeof error === 'string') {
    errorMessage = error;
    errorObj = {};
  }
  // Handle errors with a message property
  else if (error.message) {
    errorMessage = error.message;
    if (error.status) {
      errorStatus = error.status;
    }
    errorObj = {};
  }
  // Handle array of errors
  else if (Array.isArray(error)) {
    errorMessage = error.map((err) => err.message || err).join(', ');
    errorStatus = 400;
    errorObj = error;
  }

  res.status(errorStatus).json({
    success: false,
    message: errorMessage,
    error: errorObj, // Only one success key, error details only inside error
  });
}

export { handleSuccess, handleError };
