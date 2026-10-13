import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { ENV_CONFIG } from '../../config/env.config';

// Đảm bảo thư mục uploads tồn tại
if (!fs.existsSync(ENV_CONFIG.UPLOAD_DIR)) {
  fs.mkdirSync(ENV_CONFIG.UPLOAD_DIR, { recursive: true });
}

/**
 * CẤU HÌNH LƯU TRỮ TỆP TIN TỰ ĐỘNG VÀ HOÀN TOÀN MIỄN PHÍ
 * Lưu trữ ảnh và tài liệu trực tiếp trên máy chủ cục bộ (Không cần API bên thứ 3 tính phí).
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, ENV_CONFIG.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // Giới hạn tối đa 20MB
  },
});
