import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { ConversationId } from '../../../domain/value-objects/ConversationId';
import { UserId } from '../../../domain/value-objects/UserId';

/**
 * CA SỬ DỤNG (USE CASE): Đánh dấu tất cả tin nhắn trong hội thoại đã đọc
 */
export class MarkMessagesReadUseCase {
  constructor(private messageRepo: IMessageRepository) {}

  async execute(conversationIdStr: string, userIdStr: string): Promise<void> {
    const convId = new ConversationId(conversationIdStr);
    const userId = new UserId(userIdStr);
    await this.messageRepo.markAsRead(convId, userId);
  }
}
