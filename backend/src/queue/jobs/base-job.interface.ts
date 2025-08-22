export interface BaseJobPayload {
  [key: string]: any;
}

export interface BaseJob {
  id: string;
  type: string;
  payload: BaseJobPayload;
  retries?: number;
  maxRetries?: number;
  createdAt?: Date;
}
