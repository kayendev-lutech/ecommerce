import { VariantRepository } from '@module/variant/repository/variant.repository';
import { Variant } from '@module/variant/entity/variant.entity';
import { ConflictException, NotFoundException } from '@errors/app-error';
import { ensureFound, ensureNotExist } from '@utils/entity-check.util';
import { ProductRepository } from '@module/product/repository/product.respository';
import { Optional } from '@utils/optional.utils';
import { ListVariantReqDto } from '../dto/list-variant-req.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { VariantResDto } from '../dto/variant.res.dto';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { plainToInstance } from 'class-transformer';
import { ProductResDto } from '@module/product/dto/product.res.dto';
import { CreateVariantDto } from '../dto/create-variant.dto';
import { UpdateVariantDto } from '../dto/update-variant.dto';

export class VariantService {
  private variantRepository = new VariantRepository();
  private productRepository = new ProductRepository();

  async getAllWithPagination(
      reqDto: ListVariantReqDto,
    ): Promise<OffsetPaginatedDto<VariantResDto>> {
      const { data, total } = await this.variantRepository.findWithPagination(reqDto);
      
      const metaDto = new OffsetPaginationDto(total, reqDto);
      
      return new OffsetPaginatedDto(plainToInstance(VariantResDto, data), metaDto);
    }
  /**
   * Get variant by ID or throw error if not found
   */
  async getById(id: number): Promise<Variant> {
    return Optional.of(await this.variantRepository.findById(id))
      .throwIfNullable(new NotFoundException('Variant not found'))
      .get() as Variant;
  }
  /**
   * Get all variants for a specific product
   */
  async getByProductId(id: number): Promise<Variant[]> {
    const product = await this.productRepository.findById(id);
    ensureFound(product, 'Product not found');

    return this.variantRepository.findByProductId(id);
  }
  /**
   * Update variant by ID
   */
  async update(id: number, data: UpdateVariantDto): Promise<Variant> {
    const variant = Optional.of(await this.getById(id))
      .throwIfNullable(new NotFoundException('Variant not found'))
      .get() as Variant;

    if (data.name && variant.product_id) {
      const exist = await this.variantRepository.findByNameAndProductId(
        data.name,
        Number(variant.product_id),
      );
      Optional.of(exist).throwIfExist(new ConflictException('Variant name must be unique within a product'));
    }

    if (data.sku) {
      const existSku = await this.variantRepository.findBySku(data.sku);
      Optional.of(existSku).throwIfExist(new ConflictException('SKU already exists'));
    }

    const updateData: Partial<Variant> = {
      ...data,
      product_id: data.product_id !== undefined ? String(data.product_id) : undefined,
    };

    return Optional.of(await this.variantRepository.updateVariant(id, updateData))
      .throwIfNullable(new NotFoundException('Variant not found after update attempt'))
      .get() as Variant;
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
      product_id: data.product_id !== undefined ? String(data.product_id) : undefined,
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
      .get() as Variant;
  }
}