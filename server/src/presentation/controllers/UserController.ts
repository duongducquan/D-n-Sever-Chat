import { Response, NextFunction } from 'express';
import { GetAllUsersUseCase } from '../../application/use-cases/user/GetAllUsersUseCase';
import { SearchUsersUseCase } from '../../application/use-cases/user/SearchUsersUseCase';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * BỘ ĐIỀU KHIỂN NGƯỜI DÙNG (USER CONTROLLER)
 */
export class UserController {
  constructor(
    private getAllUsersUseCase: GetAllUsersUseCase,
    private searchUsersUseCase: SearchUsersUseCase
  ) {}

  public getUsers = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUserId = req.user?.userId;
      const users = await this.getAllUsersUseCase.execute(currentUserId);
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  public searchUsers = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUserId = req.user?.userId;
      const query = (req.query.q as string) || '';
      const users = await this.searchUsersUseCase.execute(query, currentUserId);
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };
}
