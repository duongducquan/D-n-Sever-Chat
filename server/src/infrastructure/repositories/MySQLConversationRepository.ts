import { RowDataPacket } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { Conversation } from '../../domain/entities/Conversation';
import { ConversationId } from '../../domain/value-objects/ConversationId';
import { UserId } from '../../domain/value-objects/UserId';
import { Participant } from '../../domain/entities/Participant';
import { pool } from '../database/mysql.connection';

interface ConversationRow extends RowDataPacket {
  id: string;
  title: string;
  is_group: number;
  created_by: string;
  last_message_id: string | null;
  created_at: Date;
  updated_at: Date;
}

interface ParticipantRow extends RowDataPacket {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: Date;
  last_read_message_id: string | null;
}

/**
 * TRIỂN KHAI KHO LƯU TRỮ HỘI THOẠI BẰNG MYSQL (WampServer)
 */
export class MySQLConversationRepository implements IConversationRepository {
  private toDomain(row: ConversationRow, participants: Participant[] = []): Conversation {
    const conv = new Conversation({
      id: new ConversationId(row.id),
      title: row.title,
      isGroup: Boolean(row.is_group),
      createdBy: new UserId(row.created_by),
      lastMessageId: row.last_message_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
    conv.setParticipants(participants);
    return conv;
  }

  async findById(id: ConversationId): Promise<Conversation | null> {
    const [rows] = await pool.query<ConversationRow[]>(
      'SELECT * FROM conversations WHERE id = ? LIMIT 1',
      [id.value]
    );
    if (rows.length === 0) return null;
    const participants = await this.getParticipants(id);
    return this.toDomain(rows[0], participants);
  }

  async findDirectConversation(user1: UserId, user2: UserId): Promise<Conversation | null> {
    const [rows] = await pool.query<ConversationRow[]>(
      `SELECT c.* FROM conversations c
       JOIN participants p1 ON c.id = p1.conversation_id AND p1.user_id = ?
       JOIN participants p2 ON c.id = p2.conversation_id AND p2.user_id = ?
       WHERE c.is_group = 0
       LIMIT 1`,
      [user1.value, user2.value]
    );
    if (rows.length === 0) return null;
    const participants = await this.getParticipants(new ConversationId(rows[0].id));
    return this.toDomain(rows[0], participants);
  }

  async getUserConversations(userId: UserId): Promise<Conversation[]> {
    const [rows] = await pool.query<ConversationRow[]>(
      `SELECT c.* FROM conversations c
       JOIN participants p ON c.id = p.conversation_id
       WHERE p.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId.value]
    );

    const conversations: Conversation[] = [];
    for (const row of rows) {
      const convId = new ConversationId(row.id);
      const participants = await this.getParticipants(convId);
      conversations.push(this.toDomain(row, participants));
    }
    return conversations;
  }

  async save(conversation: Conversation, participantIds: UserId[]): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        `INSERT INTO conversations (id, title, is_group, created_by, last_message_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          conversation.id.value,
          conversation.title,
          conversation.isGroup ? 1 : 0,
          conversation.createdBy.value,
          conversation.lastMessageId || null,
          conversation.createdAt,
          conversation.updatedAt,
        ]
      );

      for (const pId of participantIds) {
        await connection.query(
          `INSERT INTO participants (id, conversation_id, user_id, joined_at)
           VALUES (?, ?, ?, NOW())`,
          [uuidv4(), conversation.id.value, pId.value]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(conversation: Conversation): Promise<void> {
    await pool.query(
      `UPDATE conversations
       SET title = ?, last_message_id = ?, updated_at = ?
       WHERE id = ?`,
      [
        conversation.title,
        conversation.lastMessageId || null,
        conversation.updatedAt,
        conversation.id.value,
      ]
    );
  }

  async addParticipant(conversationId: ConversationId, userId: UserId): Promise<void> {
    await pool.query(
      `INSERT IGNORE INTO participants (id, conversation_id, user_id, joined_at)
       VALUES (?, ?, ?, NOW())`,
      [uuidv4(), conversationId.value, userId.value]
    );
  }

  async getParticipants(conversationId: ConversationId): Promise<Participant[]> {
    const [rows] = await pool.query<ParticipantRow[]>(
      'SELECT * FROM participants WHERE conversation_id = ?',
      [conversationId.value]
    );
    return rows.map(
      (r) =>
        new Participant({
          id: r.id,
          conversationId: new ConversationId(r.conversation_id),
          userId: new UserId(r.user_id),
          joinedAt: new Date(r.joined_at),
          lastReadMessageId: r.last_read_message_id,
        })
    );
  }

  async isUserInConversation(conversationId: ConversationId, userId: UserId): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM participants WHERE conversation_id = ? AND user_id = ? LIMIT 1',
      [conversationId.value, userId.value]
    );
    return rows.length > 0;
  }
}
