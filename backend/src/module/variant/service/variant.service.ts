import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { ConflictException, NotFoundException } from '@errors/app-error';
import { ensureFound } from '@utils/entity-check.util';
import { ProductRepository } from '@module/product/repository/product.respository';
import { Optional } from '@utils/optional.utils';
import { ListVariantReqDto } from '@module/variant/dto/list-variant-req.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { VariantResDto } from '@module/variant/dto/variant.res.dto';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { plainToInstance } from 'class-transformer';
import { CreateVariantDto } from '@module/variant/dto/create-variant.dto';
import { UpdateVariantDto } from '@module/variant/dto/update-variant.dto';
import { CursorPaginatedDto } from '@common/dto/cursor-pagination/paginated.dto';
import { CursorPaginationDto } from '@common/dto/cursor-pagination/cursor-pagination.dto';
import { buildPaginator } from '@utils/cursor-pagination';

export class VariantService {
  private variantRepository = new VariantRepository();
  private productRepository = new ProductRepository();

  async getAllWithPagination(
    reqDto: ListVariantReqDto,
  ): Promise<CursorPaginatedDto<VariantResDto>> {
    const queryBuilder = this.variantRepository.repository.createQueryBuilder('variant');

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
    return Optional.of(await this.variantRepository.findById(id))
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

  /**
   * Update variant by ID
   */
  async update(id: number, data: UpdateVariantDto): Promise<Variant> {
    const variant = Optional.of(await this.getById(id))
      .throwIfNullable(new NotFoundException('Variant not found'))
      .get<Variant>();

    if (data.name && variant.product_id) {
      const exist = await this.variantRepository.findByNameAndProductId(
        data.name,
        variant.product_id,
      );
      Optional.of(exist).throwIfExist(new ConflictException('Variant name must be unique within a product'));
    }

    if (data.sku) {
      const existSku = await this.variantRepository.findBySku(data.sku);
      Optional.of(existSku).throwIfExist(new ConflictException('SKU already exists'));
    }

    const updateData: Partial<Variant> = {
      ...data,
      ...(data.product_id !== undefined && { product_id: data.product_id }),
    };

    return Optional.of(await this.variantRepository.updateVariant(id, updateData))
      .throwIfNullable(new NotFoundException('Variant not found after update attempt'))
      .get<Variant>();
  }

  /**
   * Create a new variant for a product
   * @param data Thông tin biến thể
   * @returns Variant đã tạo
   * @throws ConflictException nếu tên hoặc SKU bị trùng
   */
  async create(data: CreateVariantDto): Promise<Variant> {
    Optional.of(await this.productRepository.findById(data.product_id)).throwIfNullable(
      new NotFoundException('Product not found'),
    );

    if (data.name) {
      Optional.of(
        await this.variantRepository.findByNameAndProductId(data.name, data.product_id),
      ).throwIfExist(new ConflictException('Variant name must be unique within a product'));
    }

    if (data.sku) {
      Optional.of(await this.variantRepository.findBySku(data.sku)).throwIfExist(
        new ConflictException('SKU already exists'),
      );
    }

    const variantData = {
      ...data,
      currency_code: data.currency_code || 'VND',
      price: data.price,
      is_active: data.is_active ?? true,
      is_default: data.is_default ?? false,
      sort_order: data.sort_order ?? 0,
      product_id: data.product_id,
    };

    return this.variantRepository.createVariant(variantData);
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