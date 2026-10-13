import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Email } from '../../../domain/value-objects/Email';
import { PasswordHasher } from '../../../infrastructure/security/PasswordHasher';
import { JwtTokenService } from '../../../infrastructure/security/JwtTokenService';
import { LoginDTO, AuthResponseDTO } from '../../dtos/AuthDTO';

/**
 * CA SỬ DỤNG (USE CASE): Đăng nhập hệ thống
 * Xác thực thông tin, cập nhật trạng thái online và cấp JWT token.
 */
export class LoginUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const input = dto.usernameOrEmail ? dto.usernameOrEmail.trim() : '';
    if (!input || !dto.password) {
      throw new Error('Vui lòng nhập tài khoản/email và mật khẩu.');
    }

    // Tìm theo email hoặc username
    let user = null;
    if (input.includes('@')) {
      try {
        const emailVO = new Email(input);
        user = await this.userRepo.findByEmail(emailVO);
      } catch {
        user = null;
      }
    }

    if (!user) {
      user = await this.userRepo.findByUsername(input);
    }

    if (!user) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    // So khớp mật khẩu đã băm
    const isPasswordValid = await PasswordHasher.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
    }

    // Cập nhật trạng thái trực tuyến
    await this.userRepo.updateStatus(user.id, 'online');

    const token = JwtTokenService.generateToken({
      userId: user.id.value,
      username: user.username,
      email: user.email.value,
    });

    return {
      user: {
        id: user.id.value,
        username: user.username,
        email: user.email.value,
        displayName: user.displayName,
        avatar: user.avatar,
        status: 'online',
        lastSeen: new Date().toISOString(),
      },
      token,
    };
  }
}
