import { Request, Response } from 'express';
import { handleError, handleSuccess } from './response.util';

/**
 * Interface representing a normalized request object for controller methods.
 * @template B Body type
 * @template H Headers type
 * @template P Params type
 * @template Q Query type
 * @template U User type
 * @template K DeviceId type
 */
export interface WrappedRequest<B = any, H = any, P = any, Q = any, U = any, K = any> {
  body: B;
  headers: H;
  params: P;
  query: Q;
  user: U;
  deviceId: K;
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}

type ControllerMethod<B = any, H = any, P = any, Q = any> = (
  request: WrappedRequest<B, H, P, Q>,
) => Promise<any>;

export type WrappedController<T> = T & { [key: string]: any };

export class WrapperClass<T extends Record<string, any>> {
  private instance: T;
  /**
   * Constructs a WrapperClass instance and returns a Proxy that wraps controller methods.
   * @param instance Controller instance to wrap
   */
  constructor(instance: T) {
    this.instance = instance;

    return new Proxy(this, {
      get: (target, prop: string | symbol) => {
        const originalMethod = target.instance[prop as keyof T];

        if (typeof originalMethod === 'function') {
          // Bind the method to the instance
          const boundMethod = originalMethod.bind(target.instance);

          return async (req: Request, res: Response) => {
            try {
              const wrappedRequest: WrappedRequest = {
                body: req.body,
                headers: req.headers,
                params: req.params,
                query: req.query,
                user: req.user,
                deviceId: req.deviceId,
                file: req.file,
                files: req.files as Express.Multer.File[],
              };

              const result = await (boundMethod as unknown as ControllerMethod)(wrappedRequest);

              handleSuccess(res, result);
            } catch (error) {
              handleError(res, error);
            }
          };
        }
        return originalMethod;
      },
    }) as unknown as WrapperClass<T> & T;
  }
}
