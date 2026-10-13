import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { GetCurrentUserUseCase } from '../../application/use-cases/auth/GetCurrentUserUseCase';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * BỘ ĐIỀU KHIỂN XÁC THỰC (AUTH CONTROLLER)
 * Tiếp nhận request HTTP, gọi Use Cases tầng Application và trả về phản hồi chuẩn REST API.
 */
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getCurrentUserUseCase: GetCurrentUserUseCase
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const user = await this.getCurrentUserUseCase.execute(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };
}
