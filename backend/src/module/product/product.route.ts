import { WrapperClasss } from '@utils/wrapper.util';
import { Router } from 'express';
import { ProductController } from '@module/product/controller/product.controller';
// Validate dto
import { validateRequest } from '@middlewares/dto-validator';
import { PaginationQueryDto } from '@module/product/dto/pagination.dto';
import { uploadProductImage } from '@middlewares/cloudinary-upload.middleware';
import { UpdateProductDto } from '@module/product/dto/update-product.dto';
import { CreateProductDto } from '@module/product/dto/create-product.dto';
import { IdParamDto } from '@module/product/dto/id-param.dto';
import { ListProductReqDto } from './dto/list-product-req.dto';
import { LoadMoreProductsReqDto } from './dto/load-more-products-req.dto';
const router = Router();
const wrappedProductController = new WrapperClasss(
  new ProductController(),
) as unknown as ProductController & { [key: string]: any };
/**
 * @swagger
 * /product:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags:
 *       - Product
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng sản phẩm mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get('/', validateRequest(ListProductReqDto, 'query'), wrappedProductController.getAll);


router.get('/load-more', validateRequest(LoadMoreProductsReqDto, 'query'), wrappedProductController.loadMore);
/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Thông tin sản phẩm
 */
router.get('/:id', validateRequest(IdParamDto, 'params'), wrappedProductController.getById);
/**
 * @swagger
 * /product:
 *   post:
 *     summary: Tạo mới sản phẩm
 *     tags:
 *       - Product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - price
 *               - category_id
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               slug:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *               price:
 *                 type: number
 *                 minimum: 0.01
 *                 maximum: 999999.99
 *               discount_price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999.99
 *               currency_code:
 *                 type: string
 *                 default: "VND"
 *               category_id:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Sản phẩm đã được tạo
 */
router.post('/', validateRequest(CreateProductDto), wrappedProductController.create);
/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               price:
 *                 type: number
 *               category_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Sản phẩm đã được cập nhật
 */
router.put(
  '/:id',
  validateRequest(IdParamDto, 'params'),
  validateRequest(UpdateProductDto, 'body'),
  wrappedProductController.update,
);
/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     responses:
 *       200:
 *         description: Sản phẩm đã được xóa
 */
router.delete('/:id', wrappedProductController.delete);
/**
 * @swagger
 * /product/{id}/upload-image:
 *   post:
 *     summary: Upload ảnh sản phẩm lên Cloudinary
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Ảnh đã được upload thành công
 */
router.post(
  '/:id/upload-image',
  validateRequest(IdParamDto, 'params'),
  uploadProductImage.single('image'),
  wrappedProductController.uploadImage,
);

export default router;
