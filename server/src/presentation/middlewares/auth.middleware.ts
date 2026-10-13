import { Request, Response, NextFunction } from 'express';
import { JwtTokenService, TokenPayload } from '../../infrastructure/security/JwtTokenService';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

/**
 * MIDDLEWARE XÁC THỰC NGƯỜI DÙNG BẰNG TOKEN JWT
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Không tìm thấy token xác thực hoặc sai định dạng Bearer.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = JwtTokenService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.',
    });
  }
}
