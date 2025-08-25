import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@errors/app-error';
import { ProductRepository } from '@module/product/repository/product.respository';
import { Optional } from '@utils/optional.utils';
import { ListVariantReqDto } from '@module/variant/dto/list-variant-req.dto';
import { VariantResDto } from '@module/variant/dto/variant.res.dto';
import { plainToInstance } from 'class-transformer';
import { CreateVariantDto } from '@module/variant/dto/create-variant.dto';
import { UpdateVariantDto } from '@module/variant/dto/update-variant.dto';
import { CursorPaginatedDto } from '@common/dto/cursor-pagination/paginated.dto';
import { CursorPaginationDto } from '@common/dto/cursor-pagination/cursor-pagination.dto';
import { buildPaginator } from '@utils/cursor-pagination';
import {
  saveVariantAttributes,
  validateCreateVariant,
  validateUpdateVariant,
  validateVariantAttributes,
} from '../helper/variant-validate.utils';

export class VariantService {
  private variantRepository = new VariantRepository();
  private productRepository = new ProductRepository();

  async getAllWithPagination(
    reqDto: ListVariantReqDto,
  ): Promise<CursorPaginatedDto<VariantResDto>> {
    const queryBuilder = this.variantRepository.createQueryBuilder('variant');

    if (reqDto.product_id) {
      queryBuilder.andWhere('variant.product_id = :product_id', { product_id: reqDto.product_id });
    }
    if (reqDto.search?.trim()) {
      queryBuilder.andWhere('variant.name ILIKE :search', { search: `%${reqDto.search.trim()}%` });
    }
    if (reqDto.is_active !== undefined) {
      queryBuilder.andWhere('variant.is_active = :is_active', { is_active: reqDto.is_active });
    }
    if (reqDto.is_default !== undefined) {
      queryBuilder.andWhere('variant.is_default = :is_default', { is_default: reqDto.is_default });
    }

    const paginator = buildPaginator({
      entity: Variant,
      alias: 'variant',
      paginationKeys: ['id'],
      query: {
        limit: reqDto.limit ?? 10,
        order: reqDto.order ?? 'DESC',
        afterCursor: reqDto.afterCursor,
        beforeCursor: reqDto.beforeCursor,
      },
    });

    const result = await paginator.paginate(queryBuilder);
    const data = Array.isArray(result.data) ? result.data : [];
    const cursor = result.cursor ?? { afterCursor: null, beforeCursor: null };

    const metaDto = new CursorPaginationDto(
      data.length,
      cursor.afterCursor ?? '',
      cursor.beforeCursor ?? '',
      reqDto,
    );

    const transformedVariants = plainToInstance(VariantResDto, data);

    return new CursorPaginatedDto(transformedVariants, metaDto);
  }

  /**
   * Get variant by ID or throw error if not found
   */
  async getById(id: number): Promise<Variant> {
    return Optional.of(
      await this.variantRepository.findOne({
        where: { id },
        relations: [
          'attributeValues',
          'attributeValues.categoryAttribute',
          'attributeValues.categoryAttributeOption',
        ],
      }),
    )
      .throwIfNullable(new NotFoundException('Variant not found'))
      .get<Variant>();
  }

  /**
   * Get all variants for a specific product
   */
  async getByProductId(id: number): Promise<Variant[]> {
    Optional.of(await this.productRepository.findById(id))
      .throwIfNullable(new NotFoundException('Product not found'))
      .get();
    return this.variantRepository.findByProductId(id);
  }
  async getByIdOrFail(id: number): Promise<Variant> {
    return Optional.of(await this.variantRepository.findById(id))
      .throwIfNullable(new NotFoundException(`Product with id ${id} not found`))
      .get<Variant>();
  }
  /**
   * Update variant by ID
   */
  async update(id: number, data: UpdateVariantDto): Promise<Variant> {
    logger.info('Start updating variant', { variantId: id });

    const currentVariant = await this.getByIdOrFail(id);

    await validateUpdateVariant(this.variantRepository, id, data, currentVariant);

    const { attributes, ...updateData } = data;

    if (attributes !== undefined && Object.keys(attributes).length > 0) {
      await validateVariantAttributes(currentVariant.product_id, id, attributes);
    }

    logger.debug('All validations passed, updating variant');

    const updatedVariant = await this.variantRepository.updateVariant(id, updateData);
    if (!updatedVariant) {
      throw new NotFoundException('Variant not found after update attempt');
    }

    if (attributes !== undefined) {
      await saveVariantAttributes(id, attributes);
    }

    const result = await this.getById(id);
    logger.info(`Variant ${id} updated successfully`);

    return result!;
  }

  /**
   * Create a new variant for a product
   * @param data Thông tin biến thể
   * @returns Variant đã tạo
   * @throws ConflictException nếu tên hoặc SKU bị trùng
   */
  async create(data: CreateVariantDto): Promise<Variant> {
    logger.info('Start creating variant', { name: data.name, product_id: data.product_id });

    // 1. Validate basic variant data
    await validateCreateVariant(this.variantRepository, this.productRepository, data);

    const { attributes = {}, ...variantData } = data;

    if (Object.keys(attributes).length > 0) {
      await validateVariantAttributes(data.product_id, null, attributes);
    }

    logger.debug('All validations passed, creating variant');

    let savedVariant: Variant;
    try {
      const variantToCreate = {
        ...variantData,
        currency_code: data.currency_code || 'VND',
        is_active: data.is_active ?? true,
        is_default: data.is_default ?? false,
        sort_order: data.sort_order ?? 0,
      };

      savedVariant = await this.variantRepository.createVariant(variantToCreate);
      logger.info('Variant saved successfully', { variantId: savedVariant.id });
    } catch (err: any) {
      logger.error('Database error saving variant', err);
      throw new BadRequestException('Failed to save variant');
    }

    if (Object.keys(attributes).length > 0) {
      await saveVariantAttributes(savedVariant.id, attributes);
    }

    const result = await this.getById(savedVariant.id);
    logger.info(`Variant ${savedVariant.id} created successfully`);

    return result!;
  }

  /**
   * Delete variant by ID
   * Note: When deleting a product, all variants are automatically deleted via CASCADE
   */
  async delete(id: number): Promise<void> {
    await this.getById(id);
    await this.variantRepository.deleteVariant(id);
  }

  /**
   * Get variant by SKU
   */
  async getBySku(sku: string): Promise<Variant> {
    return Optional.of(await this.variantRepository.findBySku(sku))
      .throwIfNullable(new NotFoundException('Variant not found'))
      .get<Variant>();
  }
}
