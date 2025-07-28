import { AppDataSource } from '@config/typeorm.config';
import { Token } from '@module/token/entity/token.entity';

export class TokenRepository {
  private repo = AppDataSource.getRepository(Token);

  async addToken(data: Partial<Token>): Promise<Token> {
    const token = this.repo.create(data);
    return await this.repo.save(token);
  }

  async getToken(userId: string, deviceId: string, tokenStr: string): Promise<Token | null> {
    return await this.repo.findOne({
      where: {
        user_id: userId,
        user_agent: deviceId,
        token: tokenStr,
      },
    });
  }

  async updateTokenBasedOnId(id: string, data: Partial<Token>): Promise<Token | null> {
    await this.repo.update({ id }, data);
    return await this.repo.findOne({ where: { id } });
  }

  async revokeTokenBasedOnDeviceId(userId: string, deviceId: string): Promise<any> {
    return await this.repo.update({ user_id: userId, user_agent: deviceId }, { is_revoked: true });
  }

  async revokeAllToken(userId: string): Promise<any> {
    return await this.repo.update({ user_id: userId }, { is_revoked: true });
  }
}
