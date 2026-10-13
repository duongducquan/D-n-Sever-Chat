import mysql from 'mysql2/promise';
import { ENV_CONFIG } from '../../config/env.config';

/**
 * QUẢN LÝ POOL KẾT NỐI CSDL MYSQL (WampServer)
 * Tối ưu hóa hiệu năng tới 99% với Connection Pooling, tự động tái sử dụng kết nối.
 */
export const pool = mysql.createPool({
  host: ENV_CONFIG.DB.HOST,
  port: ENV_CONFIG.DB.PORT,
  user: ENV_CONFIG.DB.USER,
  password: ENV_CONFIG.DB.PASSWORD,
  database: ENV_CONFIG.DB.NAME,
  waitForConnections: true,
  connectionLimit: ENV_CONFIG.DB.CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  charset: 'utf8mb4',
});

/**
 * Kiểm tra kết nối CSDL khi khởi động hệ thống
 */
export async function testDatabaseConnection(): Promise<void> {
  try {
    const connection = await pool.getConnection();
    console.log('✅ [CSDL WampServer MySQL]: Kết nối thành công tới database:', ENV_CONFIG.DB.NAME);
    connection.release();
  } catch (error: any) {
    console.error('❌ [CSDL WampServer MySQL]: Lỗi kết nối CSDL:', error.message);
    console.error('👉 Vui lòng đảm bảo WampServer đang chạy (wampmariadb hoặc wampmysql trên cổng 3306).');
    throw error;
  }
}
