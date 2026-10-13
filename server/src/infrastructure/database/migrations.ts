import { pool } from './mysql.connection';

/**
 * TỰ ĐỘNG KHỞI TẠO BẢNG CSDL (DATABASE MIGRATIONS)
 * Chuẩn hóa bảng, khóa ngoại và chỉ mục (Indexes) để truy vấn nhanh đạt 99% hiệu năng.
 */
export async function runMigrations(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Đang kiểm tra và khởi tạo cấu trúc CSDL MySQL trên WampServer...');

    // 1. Bảng Người dùng (users)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        avatar TEXT,
        status ENUM('online', 'offline') DEFAULT 'offline',
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_username (username),
        INDEX idx_users_email (email),
        INDEX idx_users_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Bảng Cuộc trò chuyện (conversations)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        is_group TINYINT(1) DEFAULT 0,
        created_by VARCHAR(36) NOT NULL,
        last_message_id VARCHAR(36) NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_conversations_created_by (created_by),
        INDEX idx_conversations_updated_at (updated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Bảng Thành viên tham gia trò chuyện (participants)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_read_message_id VARCHAR(36) NULL,
        UNIQUE KEY uq_conversation_user (conversation_id, user_id),
        INDEX idx_participants_user (user_id),
        INDEX idx_participants_conv (conversation_id),
        CONSTRAINT fk_part_conv FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
        CONSTRAINT fk_part_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Bảng Tin nhắn (messages)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        conversation_id VARCHAR(36) NOT NULL,
        sender_id VARCHAR(36) NOT NULL,
        content TEXT NOT NULL,
        message_type ENUM('text', 'image', 'file') DEFAULT 'text',
        file_url TEXT NULL,
        file_name VARCHAR(255) NULL,
        file_size INT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        seq BIGINT NOT NULL AUTO_INCREMENT UNIQUE KEY,
        INDEX idx_messages_conv (conversation_id),
        INDEX idx_messages_sender (sender_id),
        INDEX idx_messages_created (created_at),
        INDEX idx_messages_seq (seq),
        CONSTRAINT fk_msg_conv FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
        CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Tự động kiểm tra và nâng cấp bảng messages nếu chưa có seq hoặc created_at(3)
    const [seqCols] = await connection.query<any[]>('SHOW COLUMNS FROM messages LIKE "seq"');
    if (seqCols.length === 0) {
      await connection.query('ALTER TABLE messages ADD COLUMN seq BIGINT NOT NULL AUTO_INCREMENT UNIQUE KEY');
    }
    await connection.query('ALTER TABLE messages MODIFY COLUMN created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)');

    console.log('✅ Khởi tạo cấu trúc CSDL MySQL hoàn tất thành công!');
  } catch (error: any) {
    console.error('❌ Lỗi khi khởi tạo CSDL:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}
