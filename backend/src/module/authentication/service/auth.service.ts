import dayjs from 'dayjs';
import { RegisterUserDto } from '@module/authentication/dto/register.dto';
import { AuthRepository } from '@module/authentication/repository/auth.respository';
import { LoginUserDto } from '@module/authentication/dto/login.dto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@utils/jwt.util';
import {
  AppError,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@errors/app-error';

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  async register(createUserDto: RegisterUserDto, deviceId: string): Promise<any> {
    try {
      if (!createUserDto.email || !createUserDto.username) {
        throw new BadRequestException('Email and username are required');
      }
      const existUser = await this.authRepository.findUserByEmailOrUsername(
        createUserDto.email,
        createUserDto.username,
      );
      if (existUser) {
        throw new ConflictException('Username or email already exists');
      }
      const userWithRole = { ...createUserDto, role: 'user' };
      const userDetails = await this.authRepository.createUser(userWithRole);
      const payload = { userId: userDetails?.id };
      const token = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      await this.authRepository.addToken({
        user_id: payload.userId,
        token: refreshToken,
        type: 'refresh',
        expires_at: dayjs().add(7, 'day').toDate(),
        created_ip: '',
        user_agent: deviceId,
      });

      return { token, refreshToken };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to register user');
    }
  }

  async login(loginUserDto: LoginUserDto, deviceId: string): Promise<any> {
    try {
      const { email, password } = loginUserDto;
      const userDetails = await this.authRepository.comparePassword(email, password);

      if (!userDetails) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        userId: userDetails.id,
      };
      const token = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      await this.authRepository.addToken({
        user_id: payload.userId,
        token: refreshToken,
        type: 'refresh',
        expires_at: dayjs().add(7, 'day').toDate(),
        created_ip: '',
        user_agent: deviceId,
      });

      return {
        token: token,
        refreshToken: refreshToken,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to login');
    }
  }

  async refresh(refreshToken: string, deviceId: string) {
    try {
      const payload = verifyRefreshToken(refreshToken) as any;
      const userId = payload.userId;

      const tokenDoc = await this.authRepository.getToken(userId, deviceId, refreshToken);
      if (!tokenDoc) throw new UnauthorizedException('Invalid refresh token');

      let newRefreshToken = refreshToken;

      const newToken = generateRefreshToken({ userId: userId });
      tokenDoc.token = refreshToken;
      const updatedData = await this.authRepository.updateToken(tokenDoc.id as string, tokenDoc);
      if (updatedData) {
        newRefreshToken = newToken;
      }

      const newAccessToken = generateAccessToken({ userId: userId });
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to refresh token');
    }
  }

  async logout(userId: string, deviceId: string) {
    try {
      return await this.authRepository.revoke(userId, deviceId);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to logout');
    }
  }

  async logAlOut(userId: string) {
    try {
      return await this.authRepository.revokeAll(userId);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new InternalServerErrorException(error?.message || 'Failed to logout all devices');
    }
  }
}
