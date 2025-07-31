import { handleError } from '@utils/response.util';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

export function validateRequest<T>(dtoClass: any, source: 'body' | 'query' | 'params' = 'body') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req[source]) {
      return handleError(res, [`${source} is required`]);
    }

    const dtoObj = plainToInstance(dtoClass, req[source], {
      enableImplicitConversion: true,
    });

    const errors: ValidationError[] = await validate(dtoObj);

    if (errors.length > 0) {
      const messages = errors.map((error) => Object.values(error.constraints || {})).flat();
      return handleError(res, messages);
    } else {
      req[source] = dtoObj;
      next();
    }
  };
}

