import { Router } from 'express';
import { VariantController } from './controller/variant.controller.js';
import { WrapperClass } from '@utils/wrapper.util.js';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { validateRequest } from '@middlewares/dto-validator';
const router = Router();
const wrappedVariantController = new WrapperClass(
  new VariantController(),
) as unknown as VariantController & { [key: string]: any };

/**
 * @swagger
 * /variant:
 *   get:
 *     summary: Lấy danh sách biến thể sản phẩm
 *     tags:
 *       - Variant
 *     responses:
 *       200:
 *         description: Danh sách biến thể sản phẩm
 */
router.get('/', wrappedVariantController.getAll);

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
 */
router.get('/:id', wrappedVariantController.getById);

/**
 * @swagger
 * /variant:
 *   post:
 *     summary: Tạo mới biến thể sản phẩm
 *     tags:
 *       - Variant
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Biến thể đã được tạo
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
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Biến thể đã được cập nhật
 */
router.put('/:id', validateRequest(UpdateVariantDto), wrappedVariantController.update);

/**
 * @swagger
 * /variant/{id}:
 *   delete:
 *     summary: Xóa biến thể sản phẩm
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
 *         description: Biến thể đã được xóa
 */
router.delete('/:id', wrappedVariantController.delete);

export default router;
