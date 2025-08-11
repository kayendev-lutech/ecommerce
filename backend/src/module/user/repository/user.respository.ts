import { AppDataSource } from '@config/typeorm.config';
import { User } from '@module/user/entity/user.entity';
import bcrypt from 'bcryptjs';
import { RegisterUserDto } from '@module/authentication/dto/register.dto';
import { ListUserReqDto } from '../dto/list-user-req.dto';

export class UserRepository {
  public repo = AppDataSource.getRepository(User);

  async me(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findWithPagination(params: ListUserReqDto): Promise<{ data: User[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      order = 'ASC',
      sortBy = 'created_at',
      ...filters
    } = params;

    const qb = this.repo.createQueryBuilder('product');

    if (search) {
      qb.andWhere('product.name LIKE :search', { search: `%${search.trim()}%` });
    }
    const validFilterFields = ['category_id', 'is_active', 'is_visible', 'currency_code'];
    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '' && validFilterFields.includes(key)) {
        qb.andWhere(`product.${key} = :${key}`, { [key]: value });
      }
    }
    const validSortFields = ['id', 'name', 'price', 'created_at'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';

    qb.orderBy(`product.${finalSortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total };
  }

  async createUser(user: RegisterUserDto) {
    if (!user.password) {
      throw new Error('Password is required');
    }
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = this.repo.create({ ...user, password_hash: hashedPassword });
    delete (newUser as any).password;
    return this.repo.save(newUser);
  }

  async compareUserByPassword(email: string, password: string) {
    const user = await this.repo.findOne({ where: { email } });
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password_hash);
    return isMatch ? user : null;
  }
}
