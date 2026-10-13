import { Request, Response, NextFunction } from 'express';

/**
 * BỘ ĐIỀU KHIỂN UPLOAD TỆP TIN (UPLOAD CONTROLLER)
 * Hoàn toàn miễn phí, lưu trữ nội bộ trên máy chủ (Không cần API bên thứ 3)
 */
export class UploadController {
  public uploadFile = (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'Không tìm thấy tệp tin nào được tải lên.',
        });
        return;
      }

      // Tạo đường dẫn URL đầy đủ để client tải ảnh/file về
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol || 'http';
      const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: 'Tải tệp tin lên thành công!',
        data: {
          fileUrl,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
