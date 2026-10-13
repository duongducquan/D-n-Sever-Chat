import { UserResponseDTO } from './UserDTO';

export interface CreateConversationDTO {
  participantIds: string[];
  title?: string;
  isGroup?: boolean;
}

export interface ConversationResponseDTO {
  id: string;
  title: string;
  isGroup: boolean;
  createdBy: string;
  lastMessageId?: string | null;
  lastMessage?: MessageResponseDTO | null;
  unreadCount?: number;
  participants: UserResponseDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageDTO {
  conversationId: string;
  content: string;
  messageType?: 'text' | 'image' | 'file';
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}

export interface MessageResponseDTO {
  id: string;
  conversationId: string;
  senderId: string;
  sender?: UserResponseDTO | null;
  content: string;
  messageType: 'text' | 'image' | 'file';
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  isRead: boolean;
  createdAt: string;
}
