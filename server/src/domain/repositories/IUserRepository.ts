import { User } from '../entities/User';
import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

/**
 * GIAO DIỆN KHO LƯU TRỮ (REPOSITORY INTERFACE): IUserRepository
 * Định nghĩa hợp đồng lưu trữ User trong tầng Domain (tách biệt hoàn toàn với MySQL/ORM).
 */
export interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  findAll(excludeUserId?: UserId): Promise<User[]>;
  search(keyword: string, excludeUserId?: UserId): Promise<User[]>;
  updateStatus(userId: UserId, status: 'online' | 'offline'): Promise<void>;
}
