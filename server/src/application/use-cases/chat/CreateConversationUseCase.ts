import { IConversationRepository } from '../../../domain/repositories/IConversationRepository';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { Conversation } from '../../../domain/entities/Conversation';
import { ConversationId } from '../../../domain/value-objects/ConversationId';
import { UserId } from '../../../domain/value-objects/UserId';
import { CreateConversationDTO, ConversationResponseDTO } from '../../dtos/ChatDTO';
import { UserResponseDTO } from '../../dtos/UserDTO';

/**
 * CA SỬ DỤNG (USE CASE): Tạo cuộc hội thoại (1-1 hoặc Nhóm)
 */
export class CreateConversationUseCase {
  constructor(
    private conversationRepo: IConversationRepository,
    private userRepo: IUserRepository
  ) {}

  async execute(
    currentUserIdStr: string,
    dto: CreateConversationDTO
  ): Promise<ConversationResponseDTO> {
    const currentUserId = new UserId(currentUserIdStr);
    const participantIdSet = new Set<string>([currentUserIdStr, ...dto.participantIds]);
    const participantIds = Array.from(participantIdSet).map((id) => new UserId(id));

    const isGroup = dto.isGroup || participantIds.length > 2;

    // Nếu là chat 1-1, kiểm tra xem đã tồn tại cuộc hội thoại nào giữa 2 người này chưa
    if (!isGroup && participantIds.length === 2) {
      const otherUserId = participantIds.find((p) => !p.equals(currentUserId))!;
      const existing = await this.conversationRepo.findDirectConversation(
        currentUserId,
        otherUserId
      );
      if (existing) {
        return await this.mapToDTO(existing);
      }
    }

    // Tạo cuộc hội thoại mới
    const conversation = Conversation.create({
      id: new ConversationId(),
      title: dto.title || (isGroup ? 'Nhóm trò chuyện' : 'Trò chuyện riêng tư'),
      isGroup,
      createdBy: currentUserId,
    });

    await this.conversationRepo.save(conversation, participantIds);

    // Lấy lại thông tin hoàn chỉnh
    const createdConv = await this.conversationRepo.findById(conversation.id);
    return await this.mapToDTO(createdConv || conversation);
  }

  private async mapToDTO(conv: Conversation): Promise<ConversationResponseDTO> {
    const participants = await this.conversationRepo.getParticipants(conv.id);
    const userDTOs: UserResponseDTO[] = [];

    for (const p of participants) {
      const user = await this.userRepo.findById(p.userId);
      if (user) {
        userDTOs.push({
          id: user.id.value,
          username: user.username,
          email: user.email.value,
          displayName: user.displayName,
          avatar: user.avatar,
          status: user.status,
          lastSeen: user.lastSeen.toISOString(),
          createdAt: user.createdAt.toISOString(),
        });
      }
    }

    return {
      id: conv.id.value,
      title: conv.title,
      isGroup: conv.isGroup,
      createdBy: conv.createdBy.value,
      lastMessageId: conv.lastMessageId,
      unreadCount: 0,
      participants: userDTOs,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
    };
  }
}
