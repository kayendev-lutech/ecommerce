import { AppDataSource } from '@config/typeorm.config';
import { Order } from '../entity/order.entity';
import { ListOrderReqDto } from '../dto/list-order-req.dto';

export class OrderRepository {
  private repo = AppDataSource.getRepository(Order);

  async findWithPagination(params: ListOrderReqDto): Promise<{ data: Order[]; total: number }> {
    const { page = 1, limit = 10, order = 'DESC', sortBy = 'created_at', ...filters } = params;
    const qb = this.repo.createQueryBuilder('order');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        qb.andWhere(`order.${key} = :${key}`, { [key]: value });
      }
    });

    qb.orderBy(`order.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  async findById(id: number): Promise<Order | null> {
    return this.repo.findOne({ where: { id }, relations: ['items'] });
  }

  async findByOrderNumber(order_number: string): Promise<Order | null> {
    return this.repo.findOne({ where: { order_number }, relations: ['items'] });
  }

  async createOrder(data: Partial<Order>): Promise<Order> {
    const order = this.repo.create(data);
    return this.repo.save(order);
  }

  async update(id: number, data: Partial<Order>): Promise<Order | null> {
    await this.repo.update({ id }, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete({ id });
  }

  async getMonthlyOrderCount(year: number, month: number): Promise<number> {
    const qb = this.repo
      .createQueryBuilder('order')
      .where('EXTRACT(YEAR FROM order.created_at) = :year', { year })
      .andWhere('EXTRACT(MONTH FROM order.created_at) = :month', { month });
    return qb.getCount();
  }
}
