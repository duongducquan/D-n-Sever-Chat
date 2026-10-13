import { Request, Response, NextFunction } from 'express';

/**
 * MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG TOÀN HỆ THỐNG
 * Đảm bảo phản hồi đồng nhất, an toàn và dễ debug.
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('❌ [Lỗi hệ thống]:', err);

  const statusCode = err.statusCode || 400;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Đã xảy ra lỗi nội bộ trên hệ thống.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
