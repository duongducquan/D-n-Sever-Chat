import { Message } from '../entities/Message';
import { ConversationId } from '../value-objects/ConversationId';
import { UserId } from '../value-objects/UserId';

/**
 * GIAO DIỆN KHO LƯU TRỮ (REPOSITORY INTERFACE): IMessageRepository
 * Xử lý lưu và truy vấn tin nhắn với phân trang tối ưu.
 */
export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  save(message: Message): Promise<void>;
  findByConversationId(
    conversationId: ConversationId,
    limit?: number,
    offset?: number
  ): Promise<Message[]>;
  markAsRead(conversationId: ConversationId, userId: UserId): Promise<void>;
  countUnread(conversationId: ConversationId, userId: UserId): Promise<number>;
}
