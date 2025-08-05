import { AppDataSource } from '@config/typeorm.config';
import { CategoryRepository } from '@module/category/repository/category.respository';
import { CategoryService } from '@module/category/service/category.service';

export class Container {
  private static instance: Container;
  private dependencies = new Map();

  static getInstance() {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register<T>(token: string, factory: () => T): void {
    this.dependencies.set(token, factory);
  }

  resolve<T>(token: string): T {
    const factory = this.dependencies.get(token);
    if (!factory) throw new Error(`Dependency ${token} not found`);
    return factory();
  }
}

// Register dependencies
const container = Container.getInstance();
container.register('CategoryRepository', () => new CategoryRepository(AppDataSource));
container.register(
  'CategoryService',
  () => new CategoryService(container.resolve('CategoryRepository')),
);
