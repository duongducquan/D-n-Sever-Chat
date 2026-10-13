import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import os from 'os';
import { ENV_CONFIG } from './config/env.config';
import { testDatabaseConnection } from './infrastructure/database/mysql.connection';
import { runMigrations } from './infrastructure/database/migrations';

// Repositories
import { MySQLUserRepository } from './infrastructure/repositories/MySQLUserRepository';
import { MySQLConversationRepository } from './infrastructure/repositories/MySQLConversationRepository';
import { MySQLMessageRepository } from './infrastructure/repositories/MySQLMessageRepository';

// Use Cases
import { RegisterUseCase } from './application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from './application/use-cases/auth/LoginUseCase';
import { GetCurrentUserUseCase } from './application/use-cases/auth/GetCurrentUserUseCase';
import { GetAllUsersUseCase } from './application/use-cases/user/GetAllUsersUseCase';
import { SearchUsersUseCase } from './application/use-cases/user/SearchUsersUseCase';
import { CreateConversationUseCase } from './application/use-cases/chat/CreateConversationUseCase';
import { GetUserConversationsUseCase } from './application/use-cases/chat/GetUserConversationsUseCase';
import { SendMessageUseCase } from './application/use-cases/chat/SendMessageUseCase';
import { GetMessagesUseCase } from './application/use-cases/chat/GetMessagesUseCase';
import { MarkMessagesReadUseCase } from './application/use-cases/chat/MarkMessagesReadUseCase';

// Controllers
import { AuthController } from './presentation/controllers/AuthController';
import { UserController } from './presentation/controllers/UserController';
import { ChatController } from './presentation/controllers/ChatController';
import { UploadController } from './presentation/controllers/UploadController';

// Routes & Middlewares
import { createAuthRouter } from './presentation/routes/auth.routes';
import { createUserRouter } from './presentation/routes/user.routes';
import { createChatRouter } from './presentation/routes/chat.routes';
import { createUploadRouter } from './presentation/routes/upload.routes';
import { errorHandler } from './presentation/middlewares/error.middleware';
import { SocketManager } from './infrastructure/websockets/SocketManager';

/**
 * HÀM KHỞI CHẠY HỆ THỐNG MÁY CHỦ BACKEND (BOOTSTRAPPER)
 * Tuân thủ kiến trúc Domain-Driven Design (DDD) & Tối ưu hiệu năng 99%.
 */
async function bootstrap() {
  console.log('====================================================');
  console.log('🚀 ĐANG KHỞI ĐỘNG HỆ THỐNG CHAT REAL-TIME DDD...');
  console.log('====================================================');

  try {
    // 1. Kiểm tra kết nối CSDL MySQL trên WampServer
    await testDatabaseConnection();

    // 2. Tự động khởi tạo bảng CSDL và các Index tối ưu
    await runMigrations();

    // 3. Khởi tạo các Repository (Infrastructure Layer)
    const userRepo = new MySQLUserRepository();
    const conversationRepo = new MySQLConversationRepository();
    const messageRepo = new MySQLMessageRepository();

    // 4. Khởi tạo các Use Case (Application Layer)
    const registerUseCase = new RegisterUseCase(userRepo);
    const loginUseCase = new LoginUseCase(userRepo);
    const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepo);

    const getAllUsersUseCase = new GetAllUsersUseCase(userRepo);
    const searchUsersUseCase = new SearchUsersUseCase(userRepo);

    const createConversationUseCase = new CreateConversationUseCase(conversationRepo, userRepo);
    const getUserConversationsUseCase = new GetUserConversationsUseCase(
      conversationRepo,
      userRepo,
      messageRepo
    );
    const sendMessageUseCase = new SendMessageUseCase(messageRepo, conversationRepo, userRepo);
    const getMessagesUseCase = new GetMessagesUseCase(messageRepo, userRepo);
    const markMessagesReadUseCase = new MarkMessagesReadUseCase(messageRepo);

    // 5. Khởi tạo các Controller (Presentation Layer)
    const authController = new AuthController(registerUseCase, loginUseCase, getCurrentUserUseCase);
    const userController = new UserController(getAllUsersUseCase, searchUsersUseCase);
    const chatController = new ChatController(
      createConversationUseCase,
      getUserConversationsUseCase,
      sendMessageUseCase,
      getMessagesUseCase,
      markMessagesReadUseCase,
      conversationRepo,
      userRepo
    );
    const uploadController = new UploadController();

    // 6. Cấu hình Express Application
    const app = express();

    app.use(
      cors({
        origin: '*', // Hỗ trợ mọi máy tính trong mạng LAN và Internet
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    app.use(express.json({ limit: '25mb' }));
    app.use(express.urlencoded({ extended: true, limit: '25mb' }));

    // Phục vụ tệp tĩnh uploads (ảnh, tài liệu đính kèm)
    app.use('/uploads', express.static(ENV_CONFIG.UPLOAD_DIR));

    // Endpoint kiểm tra trạng thái máy chủ (Health Check & API Documentation Overview)
    app.get('/api/health', (_req, res) => {
      res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        architecture: 'Domain-Driven Design (DDD)',
        database: 'MySQL (WampServer)',
        engine: 'Express + Socket.IO + TypeScript',
        freeAPIs: {
          auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/me'],
          users: ['GET /api/users', 'GET /api/users/search?q=:name'],
          chat: [
            'GET /api/chat/conversations',
            'POST /api/chat/conversations',
            'GET /api/chat/conversations/:id/messages',
            'POST /api/chat/conversations/:id/messages',
            'PUT /api/chat/conversations/:id/read',
          ],
          upload: ['POST /api/upload (Tải ảnh/file miễn phí)'],
        },
      });
    });

    // Đăng ký các Route API
    app.use('/api/auth', createAuthRouter(authController));
    app.use('/api/users', createUserRouter(userController));
    app.use('/api/chat', createChatRouter(chatController));
    app.use('/api/upload', createUploadRouter(uploadController));

    // Share the complete app through one ngrok endpoint on port 5000.
    // API, uploads, and Socket.IO stay here; page and Next.js asset requests
    // are forwarded to the frontend dev server on port 3000.
    app.use((req, res, next) => {
      const frontendRequest = http.request(
        {
          hostname: '127.0.0.1',
          port: 3000,
          method: req.method,
          path: req.originalUrl,
          headers: {
            ...req.headers,
            host: '127.0.0.1:3000',
            'x-forwarded-host': req.headers.host || '',
            'x-forwarded-proto': req.headers['x-forwarded-proto'] || req.protocol,
          },
        },
        (frontendResponse) => {
          res.status(frontendResponse.statusCode || 502);
          for (const [name, value] of Object.entries(frontendResponse.headers)) {
            if (value !== undefined) res.setHeader(name, value);
          }
          frontendResponse.pipe(res);
        }
      );

      frontendRequest.on('error', (error) => next(error));
      req.pipe(frontendRequest);
    });

    // Middleware xử lý lỗi tập trung
    app.use(errorHandler);

    // 7. Tạo HTTP Server và gắn kết Socket.IO
    const httpServer = http.createServer(app);
    SocketManager.getInstance().init(httpServer, userRepo);

    // 8. Lắng nghe trên cổng (0.0.0.0 cho phép các máy tính khác trong LAN truy cập)
    httpServer.listen(ENV_CONFIG.PORT, ENV_CONFIG.HOST, () => {
      console.log('====================================================');
      console.log(`🎉 BACKEND DDD CHAT ĐÃ CHẠY THÀNH CÔNG TRÊN CỔNG ${ENV_CONFIG.PORT}!`);
      console.log(`🌐 Máy này (Localhost): http://localhost:${ENV_CONFIG.PORT}`);

      // Lấy IP mạng LAN để thông báo kết nối máy này sang máy khác
      const interfaces = os.networkInterfaces();
      const lanIps: string[] = [];
      for (const ifaceName of Object.keys(interfaces)) {
        for (const iface of interfaces[ifaceName] || []) {
          if (iface.family === 'IPv4' && !iface.internal) {
            lanIps.push(iface.address);
          }
        }
      }

      if (lanIps.length > 0) {
        console.log('📡 Các máy khác trong mạng LAN có thể kết nối qua:');
        lanIps.forEach((ip) => {
          console.log(`   👉 http://${ip}:${ENV_CONFIG.PORT}`);
        });
      }
      console.log('====================================================');
    });
  } catch (error) {
    console.error('💥 Khởi động Backend thất bại:', error);
    process.exit(1);
  }
}

// Khởi chạy
bootstrap();
