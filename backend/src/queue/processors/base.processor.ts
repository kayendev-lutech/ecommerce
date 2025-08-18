import { BaseJob } from '../jobs/base-job.interface';
import { logger } from '@logger/logger';

export abstract class BaseProcessor {
  protected abstract processJob(jobData: BaseJob): Promise<void>;
  
  protected async handleError(error: Error, jobData: BaseJob): Promise<void> {
    logger.error(`Job ${jobData.id} processing failed:`, {
      jobId: jobData.id,
      jobType: jobData.type,
      error: error.message,
      stack: error.stack,
    });
  }
}