import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createChatRouter(chatController: ChatController): Router {
  const router = Router();

  // Mọi route chat đều yêu cầu xác thực JWT
  router.use(authMiddleware);

  // Lấy danh sách cuộc trò chuyện: GET /api/chat/conversations
  router.get('/conversations', chatController.getConversations);

  // Tạo cuộc hội thoại mới (1-1 hoặc nhóm): POST /api/chat/conversations
  router.post('/conversations', chatController.createConversation);

  // Lấy danh sách tin nhắn: GET /api/chat/conversations/:conversationId/messages
  router.get('/conversations/:conversationId/messages', chatController.getMessages);

  // Gửi tin nhắn mới: POST /api/chat/conversations/:conversationId/messages
  router.post('/conversations/:conversationId/messages', chatController.sendMessage);

  // Đánh dấu đã đọc: PUT /api/chat/conversations/:conversationId/read
  router.put('/conversations/:conversationId/read', chatController.markAsRead);

  // Phản hồi tự động / giả lập từ Máy 2: POST /api/chat/conversations/:conversationId/simulate-reply
  router.post('/conversations/:conversationId/simulate-reply', chatController.simulateReply);

  return router;
}
