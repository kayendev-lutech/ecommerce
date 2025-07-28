import { ProductService } from '@module/product/service/product.service';
import { ProductRepository } from '@module/product/repository/product.respository';

jest.mock('@module/product/repository/product.respository');

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    productRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    productService = new ProductService();
    productService['productRepository'] = productRepository;
  });

  it('should throw error if category_id is missing when creating product', async () => {
    await expect(productService.create({ name: 'Test' })).rejects.toThrow(
      'category_id is required',
    );
  });
});
