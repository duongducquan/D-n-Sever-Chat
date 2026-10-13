import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities/User';
import { Email } from '../../../domain/value-objects/Email';
import { PasswordHasher } from '../../../infrastructure/security/PasswordHasher';
import { JwtTokenService } from '../../../infrastructure/security/JwtTokenService';
import { RegisterDTO, AuthResponseDTO } from '../../dtos/AuthDTO';

/**
 * CA SỬ DỤNG (USE CASE): Đăng ký tài khoản người dùng mới
 * Đảm bảo quy tắc nghiệp vụ: tên tài khoản và email phải là duy nhất.
 */
export class RegisterUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
    if (!dto.username || dto.username.trim().length < 3) {
      throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự.');
    }
    if (!dto.password || dto.password.length < 6) {
      throw new Error('Mật khẩu phải có ít nhất 6 ký tự.');
    }

    const emailVO = new Email(dto.email);

    // Kiểm tra tên tài khoản đã tồn tại chưa
    const existingByUsername = await this.userRepo.findByUsername(dto.username);
    if (existingByUsername) {
      throw new Error('Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.');
    }

    // Kiểm tra email đã đăng ký chưa
    const existingByEmail = await this.userRepo.findByEmail(emailVO);
    if (existingByEmail) {
      throw new Error('Email đã được đăng ký trong hệ thống.');
    }

    // Băm mật khẩu
    const passwordHash = await PasswordHasher.hash(dto.password);

    // Khởi tạo Entity User mới
    const newUser = User.create({
      username: dto.username,
      email: emailVO,
      passwordHash,
      displayName: dto.displayName || dto.username,
      avatar: dto.avatar,
    });

    // Lưu vào MySQL
    await this.userRepo.save(newUser);

    // Tạo JWT Token
    const token = JwtTokenService.generateToken({
      userId: newUser.id.value,
      username: newUser.username,
      email: newUser.email.value,
    });

    return {
      user: {
        id: newUser.id.value,
        username: newUser.username,
        email: newUser.email.value,
        displayName: newUser.displayName,
        avatar: newUser.avatar,
        status: newUser.status,
        lastSeen: newUser.lastSeen.toISOString(),
      },
      token,
    };
  }
}
