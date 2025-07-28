import { WrapperClass } from '@utils/wrapper.util';
import { Router } from 'express';
import { CategoryController } from './controller/category.controller';

const router = Router();
const wrappedCategoryController = new WrapperClass(
  new CategoryController(),
) as unknown as CategoryController & { [key: string]: any };

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
router.get('/', wrappedCategoryController.getAll);

/**
 * @swagger
 * /category/{id}:
 *   get:
 *     summary: Lấy chi tiết danh mục
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Thông tin danh mục
 */
router.get('/:id', wrappedCategoryController.getById);

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Tạo mới danh mục
 *     tags:
 *       - Category
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
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Danh mục đã được tạo
 */
router.post('/', wrappedCategoryController.create);

/**
 * @swagger
 * /category/{id}:
 *   put:
 *     summary: Cập nhật danh mục
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID danh mục
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
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Danh mục đã được cập nhật
 */
router.put('/:id', wrappedCategoryController.update);

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Xóa danh mục
 *     tags:
 *       - Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID danh mục
 *     responses:
 *       200:
 *         description: Danh mục đã được xóa
 */
router.delete('/:id', wrappedCategoryController.delete);

export default router;
