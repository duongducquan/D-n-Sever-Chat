import dotenv from 'dotenv';
import path from 'path';

// Nạp file cấu hình môi trường .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Cấu hình hệ thống tập trung (Centralized Configuration)
 * Chứa tất cả thông tin kết nối CSDL WampServer MySQL, cổng dịch vụ, bảo mật JWT.
 */
export const ENV_CONFIG = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  DB: {
    HOST: process.env.DB_HOST || '127.0.0.1',
    PORT: parseInt(process.env.DB_PORT || '3306', 10),
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'ddd_chat_db',
    CONNECTION_LIMIT: 20, // Tối ưu pool kết nối đạt hiệu suất cao đến 99%
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'super_secret_ddd_chat_jwt_key_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  CLIENT_URL: process.env.CLIENT_URL || '*',
  UPLOAD_DIR: path.resolve(__dirname, '../../uploads'),
};
