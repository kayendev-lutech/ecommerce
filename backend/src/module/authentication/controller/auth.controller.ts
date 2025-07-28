import { WrappedRequest } from '@utils/wrapper.util';
import { AuthService } from '@module/authentication/service/auth.service';
import { UnauthorizedException } from '@errors/app-error';

export class AuthController {
  private authService = new AuthService();

  async refresh({ headers, deviceId }: WrappedRequest) {
    if (!headers.refreshtoken) {
      throw new UnauthorizedException('Refresh Token Missing');
    }

    const result = await this.authService.refresh(headers.refreshtoken, deviceId);
    return {
      status: 200,
      data: result,
    };
  }

  async login({ body, deviceId }: WrappedRequest) {
    const result = await this.authService.login(body, deviceId);
    return {
      status: 200,
      data: result,
    };
  }

  async createUser({ body, deviceId }: WrappedRequest) {
    const result = await this.authService.register(body, deviceId);
    return {
      status: 201,
      data: result,
      message: 'User Registered',
    };
  }

  async logout({ deviceId, user }: WrappedRequest) {
    await this.authService.logout(user?.userId, deviceId);
    return { status: 200 };
  }

  async logAllOut({ user }: WrappedRequest) {
    await this.authService.logAlOut(user?.userId);
    return { status: 200 };
  }
}
