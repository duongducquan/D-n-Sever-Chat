import { Router } from 'express';
import { UploadController } from '../controllers/UploadController';
import { uploadMiddleware } from '../../infrastructure/storage/FileUploadService';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createUploadRouter(uploadController: UploadController): Router {
  const router = Router();

  // Upload tệp tin / hình ảnh: POST /api/upload
  router.post(
    '/',
    authMiddleware,
    uploadMiddleware.single('file'),
    uploadController.uploadFile
  );

  return router;
}
