import { CloudinaryService } from '@services/cloudinary.service';
import { ProductRepository } from '@module/product/repository/product.respository';
import { RedisService } from '@services/redis.service';
import { getProductMetaCacheKey, invalidateProductListCache } from '@utils/product/product-cache.utils';
import { logger } from '@logger/logger';
import { UploadImageJobPayload } from '../jobs/upload-image.job';
import { JobData } from '../interface/job-data.interface';

export class ImageUploadProcessor {
  private cloudinaryService = new CloudinaryService();
  private productRepository = new ProductRepository();
  private redisService = new RedisService();

  async processUploadImageJob(jobData: JobData): Promise<void> {
    const payload: UploadImageJobPayload = jobData.payload;
    
    try {
      logger.info(`Processing image upload for product ${payload.productId}`);

      const imageBuffer = Buffer.from(payload.imageBuffer, 'base64');

      const uploadResult = await this.cloudinaryService.uploadImage(imageBuffer, {
        folder: 'products',
        public_id: `product_${payload.productId}_${Date.now()}`,
      });

      // Update product in database
      const updatedProduct = await this.productRepository.updateProduct(payload.productId, {
        image_url: uploadResult.secure_url,
      });

      if (!updatedProduct) {
        throw new Error(`Product ${payload.productId} not found`);
      }

      await this.updateProductCache(payload.productId, uploadResult.secure_url, updatedProduct.updated_at);

      // Invalidate list cache
      await invalidateProductListCache(this.redisService);

      logger.info(`Image upload completed for product ${payload.productId}: ${uploadResult.secure_url}`);
    } catch (error) {
      logger.error(`Error processing image upload for product ${payload.productId}:`, error);
      throw error;
    }
  }

  private async updateProductCache(productId: number, imageUrl: string, updatedAt: Date): Promise<void> {
    try {
      const metaKey = getProductMetaCacheKey(productId);
      const cachedMeta = await this.redisService.get<any>(metaKey);

      if (cachedMeta) {
        const updatedMeta = {
          ...cachedMeta,
          image_url: imageUrl,
          updated_at: updatedAt,
        };
        await this.redisService.set(metaKey, updatedMeta, 60 * 60 * 24);
        logger.info(`Product ${productId} meta cache updated with new image`);
      }
    } catch (error) {
      logger.error(`Error updating cache for product ${productId}:`, error);
    }
  }
}