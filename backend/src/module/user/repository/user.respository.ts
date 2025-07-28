import { AppDataSource } from '@config/typeorm.config';
import { User } from '@module/user/entity/user.entity';
import bcrypt from 'bcryptjs';
import { RegisterUserDto } from '@module/authentication/dto/register.dto';

export class UserRepository {
  public repo = AppDataSource.getRepository(User);

  async me(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
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
