import { WrapperClass } from '@utils/wrapper.util';
import { Router } from 'express';
import { UserController } from '@module/user/controller/user.controller';
import authMiddleware from '@middlewares/auth.middleware';
import { UpdateUserDto } from './dto/update-user.dto';
import { validateRequest } from '@middlewares/dto-validator';

const router = Router();
const wrappedUserController = new WrapperClass(
  new UserController(),
) as unknown as UserController & { [key: string]: any };

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
router.get('/', authMiddleware, wrappedUserController.getAll);

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Lấy thông tin người dùng hiện tại
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng hiện tại
 */
router.get('/me', authMiddleware, wrappedUserController.me);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Lấy chi tiết người dùng
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 */
router.get('/:id', authMiddleware, wrappedUserController.getById);

/**
 * @swagger
 * /user/{id}:
 *   put:
 *     summary: Cập nhật người dùng
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *               role:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Người dùng đã được cập nhật
 */
router.put(
  '/:id',
  validateRequest(UpdateUserDto),
  authMiddleware,
  wrappedUserController.updateUser,
);

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Xóa người dùng
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID người dùng
 *     responses:
 *       200:
 *         description: Người dùng đã được xóa
 */
router.delete('/:id', authMiddleware, wrappedUserController.deleteUser);

export default router;
