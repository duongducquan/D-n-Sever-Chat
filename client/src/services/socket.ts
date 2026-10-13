import { io, Socket } from 'socket.io-client';
import { getBaseApiUrl } from './api';

let socket: Socket | null = null;

/**
 * KHỞI TẠO VÀ KẾT NỐI WEBSOCKET CLIENT
 * Hỗ trợ giao tiếp Real-Time giữa máy này với máy kia trên web.
 */
export function initSocket(token: string): Socket {
  if (socket) {
    socket.disconnect();
  }

  const serverUrl = getBaseApiUrl();

  socket = io(serverUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('⚡ [Socket.IO]: Đã kết nối thành công tới máy chủ Real-time!', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 [Socket.IO]: Ngắt kết nối:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('❌ [Socket.IO]: Lỗi kết nối:', error.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
