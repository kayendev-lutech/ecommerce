import { cloudinary } from '@config/cloudinary.config';
import { logger } from '@logger/logger';
import { UploadApiResponse } from 'cloudinary';

export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File | Buffer,
    options: {
      folder?: string;
      public_id?: string;
      transformation?: any[];
    } = {},
  ): Promise<UploadApiResponse> {
    try {
      const uploadOptions = {
        folder: options.folder || 'products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: options.transformation || [{ width: 800, height: 800, crop: 'limit' }],
        ...options,
      };

      let uploadResult: UploadApiResponse;

      if (Buffer.isBuffer(file)) {
        uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(uploadOptions, (error, result) => {
              if (error) reject(error);
              else resolve(result as UploadApiResponse);
            })
            .end(file);
        });
      } else {
        uploadResult = await cloudinary.uploader.upload(file.path, uploadOptions);
      }

      logger.info(`Image uploaded to Cloudinary: ${uploadResult.secure_url}`);
      return uploadResult;
    } catch (error) {
      logger.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
      logger.info(`Image deleted from Cloudinary: ${publicId}`);
    } catch (error) {
      logger.error('Cloudinary delete error:', error);
      throw error;
    }
  }
}
