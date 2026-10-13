import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { UserResponseDTO } from '../../dtos/UserDTO';

/**
 * CA SỬ DỤNG (USE CASE): Lấy thông tin người dùng hiện tại
 */
export class GetCurrentUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userIdStr: string): Promise<UserResponseDTO> {
    const user = await this.userRepo.findById(new UserId(userIdStr));
    if (!user) {
      throw new Error('Không tìm thấy thông tin người dùng.');
    }

    return {
      id: user.id.value,
      username: user.username,
      email: user.email.value,
      displayName: user.displayName,
      avatar: user.avatar,
      status: user.status,
      lastSeen: user.lastSeen.toISOString(),
      createdAt: user.createdAt.toISOString(),
    };
  }
}
