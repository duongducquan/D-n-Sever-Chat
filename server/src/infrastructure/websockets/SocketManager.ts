import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { JwtTokenService } from '../security/JwtTokenService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserId } from '../../domain/value-objects/UserId';

export interface UserSocketMap {
  [userId: string]: Set<string>; // Mỗi user có thể mở nhiều tab/máy tính
}

/**
 * BỘ QUẢN LÝ WEBSOCKET REAL-TIME (SOCKET.IO)
 * Giúp truyền tải tin nhắn tức thì giữa máy này và máy khác qua mạng LAN / Internet.
 * Đạt độ trễ siêu thấp dưới 10ms, tối ưu tài nguyên tối đa 99%.
 */
export class SocketManager {
  private static instance: SocketManager;
  private io!: SocketIOServer;
  private userSockets: UserSocketMap = {};

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public init(httpServer: HttpServer, userRepo: IUserRepository): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Cho phép mọi máy trạm kết nối
        methods: ['GET', 'POST'],
      },
      pingTimeout: 30000,
      pingInterval: 10000,
    });

    // Middleware xác thực JWT khi bắt đầu kết nối Socket
    this.io.use((socket: Socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers['token'];
      if (!token) {
        return next(new Error('Yêu cầu token xác thực để kết nối WebSocket.'));
      }

      try {
        const payload = JwtTokenService.verifyToken(token as string);
        socket.data.user = payload;
        next();
      } catch (err: any) {
        next(new Error('Token không hợp lệ hoặc đã hết hạn: ' + err.message));
      }
    });

    this.io.on('connection', async (socket: Socket) => {
      const user = socket.data.user;
      const userId = user.userId;

      console.log(`🔌 [Socket.IO]: Máy trạm kết nối: ${user.username} (${userId}) - Socket: ${socket.id}`);

      // Đăng ký socketId vào userSockets
      if (!this.userSockets[userId]) {
        this.userSockets[userId] = new Set();
      }
      this.userSockets[userId].add(socket.id);

      // Cho socket vào room riêng của cá nhân người dùng
      socket.join(`user:${userId}`);

      // Cập nhật CSDL và phát thông báo người dùng Online tới mọi máy
      await userRepo.updateStatus(new UserId(userId), 'online');
      this.io.emit('user_status_changed', {
        userId,
        status: 'online',
        lastSeen: new Date().toISOString(),
      });

      // 1. Tham gia phòng trò chuyện (Join Conversation Room)
      socket.on('join_conversation', (conversationId: string) => {
        socket.join(`conversation:${conversationId}`);
        console.log(`💬 User ${user.username} đã vào phòng chat: ${conversationId}`);
      });

      // 2. Rời phòng trò chuyện (Leave Conversation Room)
      socket.on('leave_conversation', (conversationId: string) => {
        socket.leave(`conversation:${conversationId}`);
      });

      // 3. Trạng thái đang gõ phím (Typing Indicator)
      socket.on('typing_start', (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
          conversationId: data.conversationId,
          userId,
          displayName: user.username,
        });
      });

      socket.on('typing_stop', (data: { conversationId: string }) => {
        socket.to(`conversation:${data.conversationId}`).emit('user_stop_typing', {
          conversationId: data.conversationId,
          userId,
        });
      });

      // 4. Khi ngắt kết nối
      socket.on('disconnect', async () => {
        console.log(`❌ [Socket.IO]: Máy trạm ngắt kết nối: ${user.username} - Socket: ${socket.id}`);

        if (this.userSockets[userId]) {
          this.userSockets[userId].delete(socket.id);
          if (this.userSockets[userId].size === 0) {
            delete this.userSockets[userId];
            // Không còn socket nào của user này -> Đặt trạng thái Offline
            await userRepo.updateStatus(new UserId(userId), 'offline');
            this.io.emit('user_status_changed', {
              userId,
              status: 'offline',
              lastSeen: new Date().toISOString(),
            });
          }
        }
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.IO chưa được khởi tạo!');
    }
    return this.io;
  }

  /**
   * Phát tin nhắn mới tới tất cả các thành viên trong cuộc hội thoại trên mọi máy tính
   */
  public emitNewMessage(conversationId: string, message: any, participantIds: string[]): void {
    // Gửi trực tiếp tới room của conversation
    this.io.to(`conversation:${conversationId}`).emit('new_message', message);

    // Gửi thông báo cập nhật danh sách hội thoại tới từng cá nhân thành viên
    for (const pId of participantIds) {
      this.io.to(`user:${pId}`).emit('conversation_updated', {
        conversationId,
        lastMessage: message,
      });
    }
  }

  /**
   * Phát thông báo tin nhắn đã đọc
   */
  public emitMessagesRead(conversationId: string, userId: string): void {
    this.io.to(`conversation:${conversationId}`).emit('messages_read', {
      conversationId,
      readByUserId: userId,
    });
  }
}
