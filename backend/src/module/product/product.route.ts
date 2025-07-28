import { WrapperClass } from '@utils/wrapper.util';
import { Router } from 'express';
import { ProductController } from '@module/product/controller/product.controller';
// validate dto
import { validateRequest } from '@middlewares/dto-validator';
import { PaginationQueryDto } from '@module/product/dto/pagination.dto';
import { IdParamDto } from './dto/id-param.dto';
const router = Router();
const wrappedProductController = new WrapperClass(
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
router.get('/', validateRequest(PaginationQueryDto, 'query'), wrappedProductController.getAll);
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
 *       201:
 *         description: Sản phẩm đã được tạo
 */
router.post('/', wrappedProductController.create);
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
router.put('/:id', wrappedProductController.update);
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

export default router;
