import { WrapperClasss } from '@utils/wrapper.util';
import { Router } from 'express';
import { OrderController } from './controller/order.controller';
import { validateRequest } from '@middlewares/dto-validator';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ListOrderReqDto } from './dto/list-order-req.dto';
import { IdParamDto } from '@common/dto/id-param.dto';

const router = Router();
const wrappedOrderController = new WrapperClasss(
  new OrderController(),
) as unknown as OrderController & { [key: string]: any };

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Lấy danh sách đơn hàng
 *     tags:
 *       - Order
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
 *         description: Số lượng đơn hàng mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/', validateRequest(ListOrderReqDto, 'query'), wrappedOrderController.getAll);

/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Thông tin đơn hàng
 */
router.get('/:id', validateRequest(IdParamDto, 'params'), wrappedOrderController.getById);

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Tạo mới đơn hàng
 *     tags:
 *       - Order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderDto'
 *     responses:
 *       201:
 *         description: Đơn hàng đã được tạo
 */
router.post('/', validateRequest(CreateOrderDto), wrappedOrderController.create);

/**
 * @swagger
 * /order/{id}:
 *   put:
 *     summary: Cập nhật đơn hàng
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOrderDto'
 *     responses:
 *       200:
 *         description: Đơn hàng đã được cập nhật
 */
router.put(
  '/:id',
  validateRequest(IdParamDto, 'params'),
  validateRequest(UpdateOrderDto, 'body'),
  wrappedOrderController.update,
);

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     summary: Hủy đơn hàng
 *     tags:
 *       - Order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID đơn hàng
 *     responses:
 *       200:
 *         description: Đơn hàng đã được hủy
 */
router.delete('/:id', validateRequest(IdParamDto, 'params'), wrappedOrderController.delete);

export default router;
