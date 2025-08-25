import { CloudinaryService } from '@services/cloudinary.service';
import { ProductRepository } from '@module/product/repository/product.respository';
import { RedisService } from '@services/redis.service';
import {
  getProductMetaCacheKey,
  invalidateProductListCache,
} from '@module/product/helper/product-cache.utils';
import { logger } from '@logger/logger';
import { UploadImageJobPayload } from '../jobs/upload-image.job';
import { JobData } from '../interface/job-data.interface';

export class ImageUploadProcessor {
  private cloudinaryService = new CloudinaryService();
  private productRepository = new ProductRepository();
  private redisService = new RedisService();

  async processUploadImageJob(jobData: JobData): Promise<void> {
    const { productId, imageBuffer, originalName, mimetype, size, oldPublicId } = jobData.payload;

    try {
      logger.info(`Processing image upload for product ${productId}`);

      const buffer = Buffer.from(imageBuffer, 'base64');
      const uploadResult = await this.cloudinaryService.uploadImage(buffer, {
        folder: 'products',
        public_id: `product_${productId}_${Date.now()}`,
      });

      const updatedProduct = await this.productRepository.updateProduct(productId, {
        image_url: uploadResult.secure_url,
      });
      if (!updatedProduct) throw new Error(`Product ${productId} not found`);

      await this.updateProductCache(productId, uploadResult.secure_url, updatedProduct.updated_at);
      await invalidateProductListCache(this.redisService);

      logger.info(`Image upload completed for product ${productId}: ${uploadResult.secure_url}`);

      if (oldPublicId) {
        this.cloudinaryService
          .deleteImage(oldPublicId)
          .then(() => logger.info(`Deleted old image: ${oldPublicId}`))
          .catch((err) => logger.warn(`Failed to delete old image ${oldPublicId}`, err));
      }
    } catch (err) {
      logger.error(`Image upload failed for product ${productId}`, err);
      throw err;
    }
  }

  private async updateProductCache(
    productId: number,
    imageUrl: string,
    updatedAt: Date,
  ): Promise<void> {
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
