import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserResponseDTO } from '../../dtos/UserDTO';

/**
 * CA SỬ DỤNG (USE CASE): Lấy danh sách tất cả người dùng trong hệ thống
 */
export class GetAllUsersUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(currentUserIdStr?: string): Promise<UserResponseDTO[]> {
    const excludeId = currentUserIdStr ? new UserId(currentUserIdStr) : undefined;
    const users = await this.userRepo.findAll(excludeId);

    return users.map((u) => ({
      id: u.id.value,
      username: u.username,
      email: u.email.value,
      displayName: u.displayName,
      avatar: u.avatar,
      status: u.status,
      lastSeen: u.lastSeen.toISOString(),
      createdAt: u.createdAt.toISOString(),
    }));
  }
}
