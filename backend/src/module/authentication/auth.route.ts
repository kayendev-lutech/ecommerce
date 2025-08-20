import { WrapperClasss } from '@utils/wrapper.util';
import { Router } from 'express';
import { AuthController } from '@module/authentication/controller/auth.controller';
import { validateRequest } from '@middlewares/dto-validator';
import { RegisterUserDto } from '@module/authentication/dto/register.dto';
import { LoginUserDto } from '@module/authentication/dto/login.dto';
import authMiddleware from '@middlewares/auth.middleware';
const router = Router();
const wrappedLoginController = new WrapperClasss(
  new AuthController(),
) as unknown as AuthController & { [key: string]: any };
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post('/login', validateRequest(LoginUserDto), wrappedLoginController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags:
 *       - Auth
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
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 */
router.post('/register', validateRequest(RegisterUserDto), wrappedLoginController.createUser);

/**
 * @swagger
 * /auth/logout:
 *   delete:
 *     summary: Đăng xuất
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 */
router.delete('/logout', authMiddleware, wrappedLoginController.logout);

/**
 * @swagger
 * /logAllOut:
 *   delete:
 *     summary: Đăng xuất tất cả thiết bị
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Đăng xuất tất cả thiết bị thành công
 */
router.delete('/logAllOut', authMiddleware, wrappedLoginController.logAllOut);

/**
 * @swagger
 * /auth/refresh:
 *   get:
 *     summary: Làm mới token
 *     tags:
 *       - Auth
 *     parameters:
 *       - in: header
 *         name: refreshToken
 *         required: true
 *         schema:
 *           type: string
 *         description: Refresh token
 *     responses:
 *       200:
 *         description: Làm mới token thành công
 */
router.get('/refresh', wrappedLoginController.refresh);

export default router;
