import { Response, NextFunction } from 'express';
import { CreateConversationUseCase } from '../../application/use-cases/chat/CreateConversationUseCase';
import { GetUserConversationsUseCase } from '../../application/use-cases/chat/GetUserConversationsUseCase';
import { SendMessageUseCase } from '../../application/use-cases/chat/SendMessageUseCase';
import { GetMessagesUseCase } from '../../application/use-cases/chat/GetMessagesUseCase';
import { MarkMessagesReadUseCase } from '../../application/use-cases/chat/MarkMessagesReadUseCase';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ConversationId } from '../../domain/value-objects/ConversationId';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { SocketManager } from '../../infrastructure/websockets/SocketManager';

/**
 * BỘ ĐIỀU KHIỂN CHAT (CHAT CONTROLLER)
 * Xử lý tạo phòng chat, gửi tin nhắn, lấy lịch sử tin nhắn và đồng bộ WebSocket.
 */
export class ChatController {
  constructor(
    private createConversationUseCase: CreateConversationUseCase,
    private getUserConversationsUseCase: GetUserConversationsUseCase,
    private sendMessageUseCase: SendMessageUseCase,
    private getMessagesUseCase: GetMessagesUseCase,
    private markMessagesReadUseCase: MarkMessagesReadUseCase,
    private conversationRepo: IConversationRepository,
    private userRepo: IUserRepository
  ) {}

  public getConversations = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const conversations = await this.getUserConversationsUseCase.execute(userId);
      res.status(200).json({
        success: true,
        data: conversations,
      });
    } catch (error) {
      next(error);
    }
  };

  public createConversation = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const conversation = await this.createConversationUseCase.execute(userId, req.body);
      res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      const messages = await this.getMessagesUseCase.execute(conversationId, limit, offset);

      // Đánh dấu đã đọc
      await this.markMessagesReadUseCase.execute(conversationId, req.user!.userId);

      // Báo socket đã đọc
      SocketManager.getInstance().emitMessagesRead(conversationId, req.user!.userId);

      res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  };

  public sendMessage = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;
      const { content, messageType, fileUrl, fileName, fileSize } = req.body;

      const message = await this.sendMessageUseCase.execute(userId, {
        conversationId,
        content,
        messageType,
        fileUrl,
        fileName,
        fileSize,
      });

      // Phát sự kiện Socket tới phòng chat và các thành viên ngay lập tức
      const participantIds = req.body.participantIds || [];
      SocketManager.getInstance().emitNewMessage(conversationId, message, participantIds);

      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };

  public markAsRead = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { conversationId } = req.params;

      await this.markMessagesReadUseCase.execute(conversationId, userId);
      SocketManager.getInstance().emitMessagesRead(conversationId, userId);

      res.status(200).json({
        success: true,
        message: 'Đã đánh dấu tin nhắn là đã đọc.',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PHẢN HỒI TỰ ĐỘNG TỪ MÁY THỨ 2 (CHO PHÉP TEST CHAT QUA LẠI NGAY LẬP TỨC)
   */
  public simulateReply = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUserId = req.user!.userId;
      const { conversationId } = req.params;

      const conv = await this.conversationRepo.findById(new ConversationId(conversationId));
      if (!conv) {
        res.status(404).json({ success: false, message: 'Không tìm thấy cuộc hội thoại' });
        return;
      }

      const participants = await this.conversationRepo.getParticipants(conv.id);
      const otherParticipant = participants.find((p) => p.userId.value !== currentUserId);

      if (!otherParticipant) {
        res.status(400).json({ success: false, message: 'Chưa có đối phương để trả lời' });
        return;
      }

      const otherUser = await this.userRepo.findById(otherParticipant.userId);
      if (!otherUser) {
        res.status(404).json({ success: false, message: 'Không tìm thấy thông tin đối phương' });
        return;
      }

      const sampleReplies = [
        `Chào bạn! Mình là ${otherUser.displayName} đây, đã nhận được tin nhắn từ bạn!`,
        `Hệ thống chat 2 máy gửi qua gửi lại chuẩn DDD hoạt động rất mượt mà!`,
        `Tuyệt vời! Tin nhắn thời gian thực qua WebSocket đã đồng bộ thành công sang máy mình.`,
        `Mình vừa nhận được thông báo chuông từ hệ thống, phông chữ hiển thị rất sắc nét!`,
        `Hello! Mình đang trực tuyến trên Máy 2 đây, bạn cần mình hỗ trợ gì thêm không?`,
      ];
      const replyText = req.body.content || sampleReplies[Math.floor(Math.random() * sampleReplies.length)];

      // Phát hiệu ứng đang gõ phím
      try {
        const io = SocketManager.getInstance().getIO();
        io.to(`conversation:${conversationId}`).emit('user_typing', {
          conversationId,
          userId: otherUser.id.value,
          displayName: otherUser.displayName,
        });

        // Chờ giả lập thời gian người dùng gõ
        await new Promise((resolve) => setTimeout(resolve, 800));

        io.to(`conversation:${conversationId}`).emit('user_stop_typing', {
          conversationId,
          userId: otherUser.id.value,
        });
      } catch (err) {
        // bỏ qua nếu socket chưa sẵn sàng
      }

      // Lưu tin nhắn vào MySQL qua UseCase
      const message = await this.sendMessageUseCase.execute(otherUser.id.value, {
        conversationId,
        content: replyText,
        messageType: 'text',
      });

      // Broadcast tin nhắn tới tất cả các máy
      const allParticipantIds = participants.map((p) => p.userId.value);
      SocketManager.getInstance().emitNewMessage(conversationId, message, allParticipantIds);

      res.status(201).json({
        success: true,
        message: 'Máy 2 đã phản hồi thành công!',
        data: message,
      });
    } catch (error) {
      next(error);
    }
  };
}
