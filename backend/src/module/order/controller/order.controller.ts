import { OrderService } from '../service/order.service';
import { WrappedRequest } from '@utils/wrapper.util';
import { HttpResponse } from '@utils/http-response.util';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { ListOrderReqDto } from '../dto/list-order-req.dto';
import { OrderResDto } from '../dto/order-res.dto';

export class OrderController {
  private orderService = new OrderService();

  async getAll({ query }: WrappedRequest): Promise<OffsetPaginatedDto<OrderResDto>> {
    const result = await this.orderService.getAllWithPagination(query as ListOrderReqDto);
    return result;
  }

  async getById({ params }: WrappedRequest) {
    const order = await this.orderService.getById(params.id);
    return HttpResponse.ok(order, 'Order retrieved successfully');
  }

  async create({ body }: WrappedRequest) {
    const order = await this.orderService.create(body as CreateOrderDto);
    return HttpResponse.created(order, 'Order created successfully');
  }

  async update({ params, body }: WrappedRequest) {
    const order = await this.orderService.updateStatus(params.id, body.status, body.notes);
    return HttpResponse.ok(order, 'Order updated successfully');
  }

  async delete({ params }: WrappedRequest) {
    await this.orderService.cancel(params.id, 'Deleted by admin');
    return HttpResponse.ok(null, 'Order cancelled successfully');
  }
}
