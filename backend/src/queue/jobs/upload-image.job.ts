import { v4 as uuidv4 } from 'uuid';

export interface UploadImageJobPayload {
  productId: number;
  imageBuffer: string; // Base64 encoded image
  originalName: string;
  mimetype: string;
  size: number;
}

export class UploadImageJob {
  static createJob(payload: UploadImageJobPayload) {
    return {
      id: uuidv4(),
      type: 'UPLOAD_PRODUCT_IMAGE',
      payload,
      maxRetries: 3,
    };
  }
}