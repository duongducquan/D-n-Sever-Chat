import bcrypt from 'bcryptjs';

/**
 * DỊCH VỤ BẢO MẬT: Băm và đối chiếu mật khẩu
 * Sử dụng thuật toán Bcrypt với Salt Rounds = 10 tối ưu bảo mật và tốc độ.
 */
export class PasswordHasher {
  private static readonly SALT_ROUNDS = 10;

  public static async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  public static async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}
