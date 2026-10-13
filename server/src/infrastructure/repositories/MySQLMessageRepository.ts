import { RowDataPacket } from 'mysql2/promise';
import { IMessageRepository } from '../../domain/repositories/IMessageRepository';
import { Message, MessageType } from '../../domain/entities/Message';
import { ConversationId } from '../../domain/value-objects/ConversationId';
import { UserId } from '../../domain/value-objects/UserId';
import { MessageContent } from '../../domain/value-objects/MessageContent';
import { pool } from '../database/mysql.connection';

interface MessageRow extends RowDataPacket {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  is_read: number;
  created_at: Date;
}

/**
 * TRIỂN KHAI KHO LƯU TRỮ TIN NHẮN BẰNG MYSQL (WampServer)
 */
export class MySQLMessageRepository implements IMessageRepository {
  private toDomain(row: MessageRow): Message {
    return new Message({
      id: row.id,
      conversationId: new ConversationId(row.conversation_id),
      senderId: new UserId(row.sender_id),
      content: new MessageContent(row.content),
      messageType: row.message_type,
      fileUrl: row.file_url,
      fileName: row.file_name,
      fileSize: row.file_size,
      isRead: Boolean(row.is_read),
      createdAt: new Date(row.created_at),
    });
  }

  async findById(id: string): Promise<Message | null> {
    const [rows] = await pool.query<MessageRow[]>(
      'SELECT * FROM messages WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async save(message: Message): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO messages (id, conversation_id, sender_id, content, message_type, file_url, file_name, file_size, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          message.id,
          message.conversationId.value,
          message.senderId.value,
          message.content.toString(),
          message.messageType,
          message.fileUrl || null,
          message.fileName || null,
          message.fileSize || null,
          message.isRead ? 1 : 0,
          message.createdAt,
        ]
      );

      // Cập nhật tin nhắn mới nhất trong cuộc trò chuyện
      await connection.query(
        'UPDATE conversations SET last_message_id = ?, updated_at = ? WHERE id = ?',
        [message.id, message.createdAt, message.conversationId.value]
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByConversationId(
    conversationId: ConversationId,
    limit: number = 100,
    offset: number = 0
  ): Promise<Message[]> {
    const [rows] = await pool.query<MessageRow[]>(
      `SELECT * FROM messages 
       WHERE conversation_id = ? 
       ORDER BY created_at ASC, seq ASC 
       LIMIT ? OFFSET ?`,
      [conversationId.value, limit, offset]
    );
    return rows.map((r) => this.toDomain(r));
  }

  async markAsRead(conversationId: ConversationId, userId: UserId): Promise<void> {
    await pool.query(
      `UPDATE messages 
       SET is_read = 1 
       WHERE conversation_id = ? AND sender_id != ? AND is_read = 0`,
      [conversationId.value, userId.value]
    );
  }

  async countUnread(conversationId: ConversationId, userId: UserId): Promise<number> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count 
       FROM messages 
       WHERE conversation_id = ? AND sender_id != ? AND is_read = 0`,
      [conversationId.value, userId.value]
    );
    return rows[0]?.count || 0;
  }
}
