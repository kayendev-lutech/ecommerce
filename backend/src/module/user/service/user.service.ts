import { UserRepository } from '@module/user/repository/user.respository';
import { User } from '@module/user/entity/user.entity';
import { AppError, ErrorCode, InternalServerErrorException } from '@errors/app-error';
import { RegisterUserDto } from '@module/authentication/dto/register.dto';
export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async me(id: string): Promise<User | null> {
    try {
      return await this.userRepository.me(id);
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to get user info');
    }
  }

  async getAll(): Promise<User[]> {
    try {
      return await this.userRepository.findAll();
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to get users');
    }
  }

  async getById(id: string): Promise<User | null> {
    try {
      const user = await this.userRepository.me(id);
      return user;
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to get user by id');
    }
  }

  async createUser(data: RegisterUserDto): Promise<User> {
    try {
      const existingUser = await this.userRepository.repo.findOne({
        where: [{ email: data.email }, { username: data.username }],
      });
      if (existingUser) {
        throw new AppError(ErrorCode.CONFLICT, 409, 'Username or email already exists');
      }
      return await this.userRepository.createUser(data);
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new AppError(ErrorCode.CONFLICT, 409, 'Username or email already exists');
      }
      throw new InternalServerErrorException(error?.message || 'Failed to create user');
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
      await this.userRepository.repo.update({ id }, data);
      const updated = await this.userRepository.me(id);
      if (!updated) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, 'User not found');
      }
      return updated;
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      const result = await this.userRepository.repo.delete({ id });
      if (!result.affected) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, 'User not found');
      }
    } catch (error: any) {
      throw new InternalServerErrorException(error?.message || 'Failed to delete user');
    }
  }
}
