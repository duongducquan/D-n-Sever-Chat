import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserResponseDTO } from '../../dtos/UserDTO';

/**
 * CA SỬ DỤNG (USE CASE): Tìm kiếm người dùng theo tên hoặc username
 */
export class SearchUsersUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(keyword: string, currentUserIdStr?: string): Promise<UserResponseDTO[]> {
    if (!keyword || keyword.trim().length === 0) {
      return [];
    }

    const excludeId = currentUserIdStr ? new UserId(currentUserIdStr) : undefined;
    const users = await this.userRepo.search(keyword, excludeId);

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
