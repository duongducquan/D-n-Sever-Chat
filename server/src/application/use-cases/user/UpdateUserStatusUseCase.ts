import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';

/**
 * CA SỬ DỤNG (USE CASE): Cập nhật trạng thái trực tuyến / ngoại tuyến
 */
export class UpdateUserStatusUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userIdStr: string, status: 'online' | 'offline'): Promise<void> {
    const userId = new UserId(userIdStr);
    await this.userRepo.updateStatus(userId, status);
  }
}
