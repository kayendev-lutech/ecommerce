import { WrappedRequest } from '@utils/wrapper.util';
import { UserService } from '@module/user/service/user.service';
import { AppError, ErrorCode } from '@errors/app-error';
import { instanceToPlain } from 'class-transformer';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async me({ user }: WrappedRequest) {
    const result = await this.userService.me(user.userId);
    return {
      status: 200,
      data: instanceToPlain(result),
    };
  }

  async getById({ params }: WrappedRequest) {
    const user = await this.userService.getById(params.id);
    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, 'User not found');
    }
    return {
      status: 200,
      data: instanceToPlain(user),
    };
  }

  async getAll(): Promise<any> {
    const users = await this.userService.getAll();
    return {
      status: 200,
      data: users.map((u) => instanceToPlain(u)),
    };
  }

  async updateUser({ params, body }: WrappedRequest) {
    const updated = await this.userService.updateUser(params.id, body);
    if (!updated) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, 'User not found');
    }
    return {
      status: 200,
      data: instanceToPlain(updated),
      message: 'User updated',
    };
  }

  async deleteUser({ params }: WrappedRequest) {
    await this.userService.deleteUser(params.id);
    return {
      status: 200,
      message: 'User deleted',
    };
  }
}
