import { UserRepository } from '@module/user/repository/user.respository';
import { User } from '@module/user/entity/user.entity';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@errors/app-error';
import { RegisterUserDto } from '@module/authentication/dto/register.dto';
import { Optional } from '@utils/optional.utils';
import { ListUserReqDto } from '../dto/list-user-req.dto';
import { OffsetPaginatedDto } from '@common/dto/offset-pagination/paginated.dto';
import { UserResDto } from '../dto/user.res.dto';
import { OffsetPaginationDto } from '@common/dto/offset-pagination/offset-pagination.dto';
import { plainToInstance } from 'class-transformer';
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async me(id: string): Promise<User> {
    return Optional.of(await this.userRepository.me(id))
      .throwIfNullable(new NotFoundException('User not found'))
      .get() as User;
  }
  /**
     * Retrieves a paginated list of products with optional search, sorting, and additional filters.
     * @param reqDto ListProductReqDto containing pagination, search, sort, and filter options
     * @returns OffsetPaginatedDto<ProductResDto>
     */
    async getAllWithPagination(
      reqDto: ListUserReqDto,
    ): Promise<OffsetPaginatedDto<UserResDto>> {
      const { data, total } = await this.userRepository.findWithPagination(reqDto);
      
      const metaDto = new OffsetPaginationDto(total, reqDto);
      
      return new OffsetPaginatedDto(plainToInstance(UserResDto, data), metaDto);
    }
  // async getAll(): Promise<User[]> {
  //   return await this.userRepository.findAll();
  // }

  async getById(id: string): Promise<User | null> {
    return Optional.of(await this.userRepository.me(id))
      .throwIfNullable(new NotFoundException('User not found'))
      .get();
  }

  async createUser(data: RegisterUserDto): Promise<User> {
    Optional.of(
      await this.userRepository.repo.findOne({
        where: [{ email: data.email }, { username: data.username }],
      }),
    ).throwIfExist(new ConflictException('Username or email already exists'));

    try {
      return await this.userRepository.createUser(data);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to create user');
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    await this.me(id);

    await this.userRepository.repo.update({ id }, data);
    return Optional.of(await this.userRepository.me(id))
      .throwIfNullable(new NotFoundException('User not found'))
      .get() as User;
  }

  async deleteUser(id: string): Promise<void> {
    await this.me(id);

    const result = await this.userRepository.repo.delete({ id });
    if (!result.affected) {
      throw new NotFoundException('User not found');
    }
  }
}
