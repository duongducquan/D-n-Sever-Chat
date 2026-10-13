import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createUserRouter(userController: UserController): Router {
  const router = Router();

  // Lấy danh sách tất cả người dùng: GET /api/users
  router.get('/', authMiddleware, userController.getUsers);

  // Tìm kiếm người dùng: GET /api/users/search?q=...
  router.get('/search', authMiddleware, userController.searchUsers);

  return router;
}
