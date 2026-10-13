import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { UserId } from '../../../domain/value-objects/UserId';
import { ConversationResponseDTO, MessageResponseDTO } from '../../dtos/ChatDTO';
import { UserResponseDTO } from '../../dtos/UserDTO';

/**
 * CA SỬ DỤNG (USE CASE): Lấy danh sách cuộc hội thoại của một người dùng
 */
export class GetUserConversationsUseCase {
  constructor(
    private conversationRepo: IConversationRepository,
    private userRepo: IUserRepository,
    private messageRepo: IMessageRepository
  ) {}

  async execute(userIdStr: string): Promise<ConversationResponseDTO[]> {
    const userId = new UserId(userIdStr);
    const conversations = await this.conversationRepo.getUserConversations(userId);

    const result: ConversationResponseDTO[] = [];

    for (const conv of conversations) {
      const participants = await this.conversationRepo.getParticipants(conv.id);
      const userDTOs: UserResponseDTO[] = [];

      for (const p of participants) {
        const u = await this.userRepo.findById(p.userId);
        if (u) {
          userDTOs.push({
            id: u.id.value,
            username: u.username,
            email: u.email.value,
            displayName: u.displayName,
            avatar: u.avatar,
            status: u.status,
            lastSeen: u.lastSeen.toISOString(),
            createdAt: u.createdAt.toISOString(),
          });
        }
      }

      // Lấy tin nhắn cuối cùng nếu có
      let lastMessageDTO: MessageResponseDTO | null = null;
      if (conv.lastMessageId) {
        const lastMsg = await this.messageRepo.findById(conv.lastMessageId);
        if (lastMsg) {
          const sender = await this.userRepo.findById(lastMsg.senderId);
          lastMessageDTO = {
            id: lastMsg.id,
            conversationId: lastMsg.conversationId.value,
            senderId: lastMsg.senderId.value,
            sender: sender
              ? {
                  id: sender.id.value,
                  username: sender.username,
                  email: sender.email.value,
                  displayName: sender.displayName,
                  avatar: sender.avatar,
                  status: sender.status,
                  lastSeen: sender.lastSeen.toISOString(),
                  createdAt: sender.createdAt.toISOString(),
                }
              : null,
            content: lastMsg.content.toString(),
            messageType: lastMsg.messageType,
            fileUrl: lastMsg.fileUrl,
            fileName: lastMsg.fileName,
            fileSize: lastMsg.fileSize,
            isRead: lastMsg.isRead,
            createdAt: lastMsg.createdAt.toISOString(),
          };
        }
      }

      // Đếm số tin nhắn chưa đọc
      const unreadCount = await this.messageRepo.countUnread(conv.id, userId);

      // Nếu là chat 1-1, tự động gán tiêu đề là tên người kia
      let title = conv.title;
      if (!conv.isGroup) {
        const otherUser = userDTOs.find((u) => u.id !== userIdStr);
        if (otherUser) {
          title = otherUser.displayName || otherUser.username;
        }
      }

      result.push({
        id: conv.id.value,
        title,
        isGroup: conv.isGroup,
        createdBy: conv.createdBy.value,
        lastMessageId: conv.lastMessageId,
        lastMessage: lastMessageDTO,
        unreadCount,
        participants: userDTOs,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
      });
    }

    return result;
  }
}
