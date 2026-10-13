import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  // Đăng ký tài khoản mới: POST /api/auth/register
  router.post('/register', authController.register);

  // Đăng nhập: POST /api/auth/login
  router.post('/login', authController.login);

  // Lấy thông tin tài khoản hiện tại: GET /api/auth/me
  router.get('/me', authMiddleware, authController.getMe);

  return router;
}
