import { NotFoundException, ConflictException } from '@errors/app-error';

/**
 * Throws NotFoundException if entity note exist.
 * @param entity Entity cần kiểm tra
 * @param message Thông báo lỗi
 */
export function ensureFound<T>(entity: T | null | undefined, message = 'Resource not found'): T {
  if (!entity) throw new NotFoundException(message);
  return entity;
}

/**
 * Throws ConflictException if entity already exist.
 * @param entity Entity cần kiểm tra
 * @param message Thông báo lỗi
 */
export function ensureNotExist<T>(entity: T | null | undefined, message = 'Resource already exists'): void {
  if (entity) throw new ConflictException(message);
}