import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Message } from '../../../domain/entities/Message';
import { ConversationId } from '../../../domain/value-objects/ConversationId';
import { UserId } from '../../../domain/value-objects/UserId';
import { MessageContent } from '../../../domain/value-objects/MessageContent';
import { SendMessageDTO, MessageResponseDTO } from '../../dtos/ChatDTO';

/**
 * CA SỬ DỤNG (USE CASE): Gửi tin nhắn
 * Kiểm tra quyền tham gia hội thoại, lưu tin nhắn, cập nhật cuộc trò chuyện.
 */
export class SendMessageUseCase {
  constructor(
    private messageRepo: IMessageRepository,
    private conversationRepo: IConversationRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(senderIdStr: string, dto: SendMessageDTO): Promise<MessageResponseDTO> {
    const senderId = new UserId(senderIdStr);
    const convId = new ConversationId(dto.conversationId);

    // Kiểm tra cuộc trò chuyện có tồn tại không
    const conv = await this.conversationRepo.findById(convId);
    if (!conv) {
      throw new Error('Cuộc hội thoại không tồn tại.');
    }

    // Kiểm tra người gửi có trong cuộc hội thoại không
    const isMember = await this.conversationRepo.isUserInConversation(convId, senderId);
    if (!isMember) {
      // Nếu chưa có, tự động thêm vào cuộc hội thoại
      await this.conversationRepo.addParticipant(convId, senderId);
    }

    // Tạo Entity Message
    const message = Message.create({
      conversationId: convId,
      senderId,
      content: new MessageContent(dto.content),
      messageType: dto.messageType || 'text',
      fileUrl: dto.fileUrl || null,
      fileName: dto.fileName || null,
      fileSize: dto.fileSize || null,
    });

    await this.messageRepo.save(message);

    // Lấy thông tin người gửi
    const sender = await this.userRepo.findById(senderId);

    return {
      id: message.id,
      conversationId: message.conversationId.value,
      senderId: message.senderId.value,
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
      content: message.content.toString(),
      messageType: message.messageType,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
