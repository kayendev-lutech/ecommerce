import { UserRepository } from '@module/user/repository/user.respository';
import { TokenRepository } from '@module/token/repository/token.respository';
import { User } from '@module/user/entity/user.entity';
import { Token } from '@module/token/entity/token.entity';
import { RegisterUserDto } from '@module/authentication/dto/register.dto';

export class AuthRepository {
  private userRespository: UserRepository;
  private tokenRespository: TokenRepository;

  constructor() {
    this.userRespository = new UserRepository();
    this.tokenRespository = new TokenRepository();
  }

  async createUser(user: RegisterUserDto): Promise<User> {
    return this.userRespository.createUser(user);
  }

  async comparePassword(email: string, password: string): Promise<User | null> {
    return this.userRespository.compareUserByPassword(email, password);
  }

  async addToken(data: Partial<Token>) {
    return this.tokenRespository.addToken(data);
  }

  async getToken(userId: string, deviceId: string, token: string) {
    return this.tokenRespository.getToken(userId, deviceId, token);
  }

  async updateToken(id: string, data: Partial<Token>) {
    return this.tokenRespository.updateTokenBasedOnId(id, data);
  }

  async revoke(userId: string, deviceId: string) {
    return this.tokenRespository.revokeTokenBasedOnDeviceId(userId, deviceId);
  }

  async revokeAll(userId: string) {
    return this.tokenRespository.revokeAllToken(userId);
  }
  async findUserByEmailOrUsername(email?: string, username?: string) {
    const where = [];
    if (email) where.push({ email });
    if (username) where.push({ username });

    if (where.length === 0) return null;

    return this.userRespository.repo.findOne({ where });
  }
}
