'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth, User } from './AuthContext';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: User | null;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  isGroup: boolean;
  createdBy: string;
  lastMessageId?: string | null;
  lastMessage?: Message | null;
  unreadCount?: number;
  participants: User[];
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  isLoadingMessages: boolean;
  typingUsers: string[];
  onlineUserIds: Set<string>;
  setActiveConversation: (conv: Conversation | null) => void;
  sendMessage: (
    content: string,
    messageType?: 'text' | 'image' | 'file',
    fileInfo?: { fileUrl?: string; fileName?: string; fileSize?: number }
  ) => Promise<void>;
  createConversation: (
    participantIds: string[],
    title?: string,
    isGroup?: boolean
  ) => Promise<Conversation>;
  refreshConversations: () => Promise<void>;
  sendTyping: (isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Hàm chuẩn hóa, lọc trùng lặp và sắp xếp tin nhắn tăng dần theo thời gian (cũ nhất ở đầu, mới nhất ở cuối)
export function sortAndDeduplicateMessages(messages: Message[]): Message[] {
  const map = new Map<string, Message>();
  for (const msg of messages) {
    if (!msg || !msg.id) continue;
    if (map.has(msg.id)) {
      const existing = map.get(msg.id)!;
      map.set(msg.id, {
        ...existing,
        ...msg,
        sender: msg.sender || existing.sender,
      });
    } else {
      map.set(msg.id, msg);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return String(a.id).localeCompare(String(b.id));
  });
}

// Âm thanh thông báo phát bằng Web Audio API (Không phụ thuộc tệp âm thanh bên ngoài, 100% độc lập)
function playMessageChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {
    // Trình duyệt có thể chặn autoplay âm thanh khi chưa tương tác
  }
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  const activeConvRef = useRef<Conversation | null>(null);
  activeConvRef.current = activeConversation;

  // Lấy danh sách hội thoại
  const refreshConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiRequest<Conversation[]>('/api/chat/conversations');
      if (res.data) {
        setConversations(res.data);
      }
    } catch (e) {
      console.error('Lỗi lấy danh sách hội thoại:', e);
    }
  }, [user]);

  // Tải tin nhắn khi chọn hội thoại
  const loadMessages = useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await apiRequest<Message[]>(`/api/chat/conversations/${convId}/messages`);
      if (res.data) {
        const serverMessages = res.data;
        setMessages((prev) => {
          // Tránh ghi đè nếu đã chuyển sang hội thoại khác
          if (activeConvRef.current?.id !== convId) return prev;
          // Kết hợp danh sách tải từ server với các tin nhắn đã nhận được qua websocket
          return sortAndDeduplicateMessages([...prev, ...serverMessages]);
        });
      }
    } catch (e) {
      console.error('Lỗi tải tin nhắn:', e);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Lắng nghe sự kiện WebSocket Real-Time
  useEffect(() => {
    if (!user) {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      return;
    }

    refreshConversations();

    const socket = getSocket();
    if (!socket) return;

    // Khi có tin nhắn mới qua WebSocket
    const handleNewMessage = (newMsg: Message) => {
      // Nếu đang mở đúng cuộc trò chuyện này
      if (activeConvRef.current && activeConvRef.current.id === newMsg.conversationId) {
        setMessages((prev) => sortAndDeduplicateMessages([...prev, newMsg]));
      }

      // Phát âm thanh nếu tin nhắn do người khác gửi đến
      if (user && newMsg.senderId !== user.id) {
        playMessageChime();
      }

      // Cập nhật lại cuộc trò chuyện trong danh sách sidebar
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === newMsg.conversationId) {
            const isCurrent = activeConvRef.current?.id === c.id;
            return {
              ...c,
              lastMessage: newMsg,
              lastMessageId: newMsg.id,
              unreadCount: isCurrent ? 0 : (c.unreadCount || 0) + 1,
              updatedAt: newMsg.createdAt,
            };
          }
          return c;
        })
      );
    };

    // Khi người dùng thay đổi trạng thái Online/Offline
    const handleStatusChanged = (data: { userId: string; status: 'online' | 'offline' }) => {
      setOnlineUserIds((prev) => {
        const next = new Set(prev);
        if (data.status === 'online') {
          next.add(data.userId);
        } else {
          next.delete(data.userId);
        }
        return next;
      });

      // Cập nhật trong danh sách hội thoại
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          participants: c.participants.map((p) =>
            p.id === data.userId ? { ...p, status: data.status } : p
          ),
        }))
      );
    };

    // Khi người khác đang gõ phím
    const handleUserTyping = (data: { conversationId: string; userId: string; displayName: string }) => {
      if (activeConvRef.current?.id === data.conversationId && data.userId !== user.id) {
        setTypingUsers((prev) => Array.from(new Set([...prev, data.displayName])));
      }
    };

    // Khi người khác dừng gõ phím
    const handleUserStopTyping = (data: { conversationId: string; userId: string }) => {
      if (activeConvRef.current?.id === data.conversationId) {
        setTypingUsers((prev) => prev.filter((name) => name !== user.username));
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_status_changed', handleStatusChanged);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_status_changed', handleStatusChanged);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [user, refreshConversations]);

  // Xử lý khi người dùng chọn một cuộc hội thoại
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    // Làm mới danh sách tin nhắn khi đổi hội thoại
    setMessages([]);

    const socket = getSocket();
    if (socket) {
      socket.emit('join_conversation', activeConversation.id);
    }

    loadMessages(activeConversation.id);

    // Xóa badge chưa đọc của hội thoại này
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c))
    );

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation.id);
      }
    };
  }, [activeConversation?.id, loadMessages]);

  // Gửi tin nhắn
  const sendMessage = async (
    content: string,
    messageType: 'text' | 'image' | 'file' = 'text',
    fileInfo?: { fileUrl?: string; fileName?: string; fileSize?: number }
  ) => {
    if (!activeConversation || !user) return;

    const convId = activeConversation.id;
    const participantIds = activeConversation.participants.map((p) => p.id);

    const res = await apiRequest<Message>(`/api/chat/conversations/${convId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content,
        messageType,
        fileUrl: fileInfo?.fileUrl,
        fileName: fileInfo?.fileName,
        fileSize: fileInfo?.fileSize,
        participantIds,
      }),
    });

    if (res.data) {
      const confirmedMsg = res.data;
      if (activeConvRef.current?.id === confirmedMsg.conversationId) {
        setMessages((prev) => sortAndDeduplicateMessages([...prev, confirmedMsg]));
      }
    }
  };

  // Tạo cuộc hội thoại mới
  const createConversation = async (
    participantIds: string[],
    title?: string,
    isGroup: boolean = false
  ): Promise<Conversation> => {
    const res = await apiRequest<Conversation>('/api/chat/conversations', {
      method: 'POST',
      body: JSON.stringify({ participantIds, title, isGroup }),
    });

    if (res.data) {
      await refreshConversations();
      setActiveConversation(res.data);
      return res.data;
    }
    throw new Error('Không thể tạo cuộc trò chuyện');
  };

  // Gửi sự kiện đang gõ phím
  const sendTyping = (isTyping: boolean) => {
    const socket = getSocket();
    if (!socket || !activeConversation) return;

    if (isTyping) {
      socket.emit('typing_start', { conversationId: activeConversation.id });
    } else {
      socket.emit('typing_stop', { conversationId: activeConversation.id });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoadingMessages,
        typingUsers,
        onlineUserIds,
        setActiveConversation,
        sendMessage,
        createConversation,
        refreshConversations,
        sendTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat phải được dùng bên trong ChatProvider');
  }
  return context;
};
