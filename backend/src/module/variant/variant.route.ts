import { Router } from 'express';
import { VariantController } from '@module/variant//controller/variant.controller';
import { WrapperClass } from '@utils/wrapper.util.js';
import { CreateVariantDto } from '@module/variant//dto/create-variant.dto';
import { UpdateVariantDto } from '@module/variant//dto/update-variant.dto';
import { validateRequest } from '@middlewares/dto-validator';
import { IdParamDto } from '@module/variant/dto/variant-id-query.dto';
import { ProductIdQueryDto } from '@module/variant/dto/product-id-query.dto';
const router = Router();
const wrappedVariantController = new WrapperClass(
  new VariantController(),
) as unknown as VariantController & { [key: string]: any };

/**
 * @swagger
 * /variant:
 *   get:
 *     summary: Lấy danh sách biến thể theo product_id
 *     tags:
 *       - Variant
 *     parameters:
 *       - in: query
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID sản phẩm để lấy variants
 *     responses:
 *       200:
 *         description: Danh sách biến thể của sản phẩm
 *       400:
 *         description: Thiếu product_id
 *       404:
 *         description: Không tìm thấy sản phẩm
 */
router.get('/', validateRequest(ProductIdQueryDto, 'query'), wrappedVariantController.getAll);

/**
 * @swagger
 * /variant/{id}:
 *   get:
 *     summary: Lấy chi tiết biến thể sản phẩm
 *     tags:
 *       - Variant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID biến thể
 *     responses:
 *       200:
 *         description: Thông tin biến thể sản phẩm
 *       404:
 *         description: Không tìm thấy biến thể
 */
router.get('/:id', validateRequest(IdParamDto, 'params'), wrappedVariantController.getById);

/**
 * @swagger
 * /variant:
 *   post:
 *     summary: Tạo mới biến thể sản phẩm (standalone)
 *     description: Tạo một biến thể riêng lẻ cho sản phẩm. Để tạo nhiều variants cùng lúc, sử dụng API tạo product với mảng variants.
 *     tags:
 *       - Variant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - name
 *             properties:
 *               product_id:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID sản phẩm
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Tên biến thể (phải unique trong product)
 *               sku:
 *                 type: string
 *                 description: Mã SKU (phải unique toàn cục)
 *               barcode:
 *                 type: string
 *                 description: Mã vạch
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999.99
 *                 description: Giá (nếu không có sẽ lấy từ product)
 *               discount_price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999.99
 *                 description: Giá khuyến mại
 *               currency_code:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *                 default: "VND"
 *                 description: Mã tiền tệ
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Số lượng trong kho
 *               stock_reserved:
 *                 type: integer
 *                 minimum: 0
 *                 description: Số lượng đã đặt trước
 *               low_stock_threshold:
 *                 type: integer
 *                 minimum: 0
 *                 description: Ngưỡng cảnh báo hết hàng
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 description: Trọng lượng (kg)
 *               image_url:
 *                 type: string
 *                 description: URL hình ảnh biến thể
 *               attributes:
 *                 type: object
 *                 description: Thuộc tính biến thể (JSON)
 *                 example:
 *                   color: "Red"
 *                   size: "XL"
 *                   material: "Cotton"
 *               is_active:
 *                 type: boolean
 *                 default: true
 *                 description: Trạng thái hoạt động
 *               is_default:
 *                 type: boolean
 *                 default: false
 *                 description: Biến thể mặc định
 *               sort_order:
 *                 type: integer
 *                 minimum: 0
 *                 description: Thứ tự sắp xếp
 *     responses:
 *       201:
 *         description: Biến thể đã được tạo thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       409:
 *         description: Tên variant đã tồn tại trong product hoặc SKU đã tồn tại
 */
router.post('/', validateRequest(CreateVariantDto), wrappedVariantController.create);

/**
 * @swagger
 * /variant/{id}:
 *   put:
 *     summary: Cập nhật biến thể sản phẩm
 *     tags:
 *       - Variant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID biến thể
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Tên biến thể
 *               sku:
 *                 type: string
 *                 description: Mã SKU
 *               barcode:
 *                 type: string
 *                 description: Mã vạch
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999.99
 *                 description: Giá
 *               discount_price:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 999999.99
 *                 description: Giá khuyến mại
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Số lượng trong kho
 *               stock_reserved:
 *                 type: integer
 *                 minimum: 0
 *                 description: Số lượng đã đặt trước
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 description: Trọng lượng
 *               image_url:
 *                 type: string
 *                 description: URL hình ảnh
 *               attributes:
 *                 type: object
 *                 description: Thuộc tính biến thể
 *               is_active:
 *                 type: boolean
 *                 description: Trạng thái hoạt động
 *               is_default:
 *                 type: boolean
 *                 description: Biến thể mặc định
 *               sort_order:
 *                 type: integer
 *                 description: Thứ tự sắp xếp
 *     responses:
 *       200:
 *         description: Biến thể đã được cập nhật
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       404:
 *         description: Không tìm thấy biến thể
 *       409:
 *         description: Tên variant hoặc SKU đã tồn tại
 */
router.put(
  '/:id',
  [validateRequest(IdParamDto, 'params'), validateRequest(UpdateVariantDto)],
  wrappedVariantController.update,
);

/**
 * @swagger
 * /variant/{id}:
 *   delete:
 *     summary: Xóa biến thể sản phẩm
 *     description: Xóa một biến thể riêng lẻ. Khi xóa product, tất cả variants sẽ tự động bị xóa (CASCADE).
 *     tags:
 *       - Variant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID biến thể
 *     responses:
 *       204:
 *         description: Biến thể đã được xóa thành công
 *       404:
 *         description: Không tìm thấy biến thể
 */
router.delete('/:id', validateRequest(IdParamDto, 'params'), wrappedVariantController.delete);

export default router;
