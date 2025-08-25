export interface JobData {
  id: string;
  type: string;
  payload: any;
  retries?: number;
  maxRetries?: number;
  createdAt?: Date;
}
