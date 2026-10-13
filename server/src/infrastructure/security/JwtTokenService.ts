import jwt from 'jsonwebtoken';
import { ENV_CONFIG } from '../../config/env.config';

export interface TokenPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * DỊCH VỤ TOKEN JWT (Json Web Token)
 * Xác thực phiên người dùng không trạng thái (Stateless), hiệu suất cao.
 */
export class JwtTokenService {
  public static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, ENV_CONFIG.JWT.SECRET, {
      expiresIn: ENV_CONFIG.JWT.EXPIRES_IN,
    } as jwt.SignOptions);
  }

  public static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, ENV_CONFIG.JWT.SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn.');
    }
  }
}
