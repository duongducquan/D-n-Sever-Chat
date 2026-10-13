import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ConversationId } from '../../../domain/value-objects/ConversationId';
import { UserId } from '../../../domain/value-objects/UserId';
import { MessageResponseDTO } from '../../dtos/ChatDTO';
import { UserResponseDTO } from '../../dtos/UserDTO';

/**
 * CA SỬ DỤNG (USE CASE): Lấy danh sách tin nhắn trong một cuộc hội thoại
 */
export class GetMessagesUseCase {
  constructor(
    private messageRepo: IMessageRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(
    conversationIdStr: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<MessageResponseDTO[]> {
    const convId = new ConversationId(conversationIdStr);
    const messages = await this.messageRepo.findByConversationId(convId, limit, offset);

    // Cache thông tin người dùng trong cuộc hội thoại để giảm thiểu số query
    const userCache = new Map<string, UserResponseDTO>();

    const result: MessageResponseDTO[] = [];

    for (const msg of messages) {
      let senderDTO = userCache.get(msg.senderId.value);
      if (!senderDTO) {
        const u = await this.userRepo.findById(msg.senderId);
        if (u) {
          senderDTO = {
            id: u.id.value,
            username: u.username,
            email: u.email.value,
            displayName: u.displayName,
            avatar: u.avatar,
            status: u.status,
            lastSeen: u.lastSeen.toISOString(),
            createdAt: u.createdAt.toISOString(),
          };
          userCache.set(msg.senderId.value, senderDTO);
        }
      }

      result.push({
        id: msg.id,
        conversationId: msg.conversationId.value,
        senderId: msg.senderId.value,
        sender: senderDTO || null,
        content: msg.content.toString(),
        messageType: msg.messageType,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        isRead: msg.isRead,
        createdAt: msg.createdAt.toISOString(),
      });
    }

    return result;
  }
}
