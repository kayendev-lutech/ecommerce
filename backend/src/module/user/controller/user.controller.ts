import { WrappedRequest } from '@utils/wrapper.util';
import { UserService } from '@module/user/service/user.service';
import { AppError, ErrorCode } from '@errors/app-error';
import { instanceToPlain } from 'class-transformer';
import { HttpResponse } from '@utils/http-response.util';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async me({ user }: WrappedRequest) {
    const result = await this.userService.me(user.userId);
    return HttpResponse.ok(instanceToPlain(result), 'User profile retrieved successfully');
  }

  async getById({ params }: WrappedRequest) {
    const user = await this.userService.getById(params.id);
    if (!user) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, 'User not found');
    }
    return HttpResponse.ok(instanceToPlain(user), 'User retrieved successfully');
  }

  async getAll(): Promise<any> {
    const users = await this.userService.getAll();
    return HttpResponse.ok(
      users.map((u) => instanceToPlain(u)),
      'Users retrieved successfully'
    );
  }

  async createUser({ body }: WrappedRequest) {
    const created = await this.userService.createUser(body);
    return HttpResponse.created(instanceToPlain(created), 'User created successfully');
  }

  async updateUser({ params, body }: WrappedRequest) {
    const updated = await this.userService.updateUser(params.id, body);
    if (!updated) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, 'User not found');
    }
    return HttpResponse.ok(instanceToPlain(updated), 'User updated successfully');
  }

  async deleteUser({ params }: WrappedRequest) {
    await this.userService.deleteUser(params.id);
    return HttpResponse.noContent('User deleted successfully');
  }
}