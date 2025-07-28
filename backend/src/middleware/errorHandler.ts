import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Nếu là CustomError thì lấy status code, nếu không thì trả về 500
  const status = err?.HttpStatusCode || err?.status || 500;
  const json = err?.JSON || {
    errorType: 'General',
    errorMessage: err?.message || 'Internal Server Error',
    errors: null,
    errorRaw: err,
    errorsValidation: null,
    stack: err?.stack,
  };
  return res.status(status).json(json);
};
