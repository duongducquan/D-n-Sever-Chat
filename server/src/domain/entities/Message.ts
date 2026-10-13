import { UserId } from '../value-objects/UserId';
import { ConversationId } from '../value-objects/ConversationId';
import { MessageContent } from '../value-objects/MessageContent';
import { v4 as uuidv4 } from 'uuid';

export type MessageType = 'text' | 'image' | 'file';

export interface MessageProps {
  id: string;
  conversationId: ConversationId;
  senderId: UserId;
  content: MessageContent;
  messageType: MessageType;
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  isRead: boolean;
  createdAt: Date;
}

/**
 * THỰC THỂ (ENTITY): Message
 * Đại diện cho tin nhắn gửi giữa các máy tính qua Web.
 */
export class Message {
  private props: MessageProps;

  constructor(props: MessageProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get conversationId(): ConversationId {
    return this.props.conversationId;
  }

  get senderId(): UserId {
    return this.props.senderId;
  }

  get content(): MessageContent {
    return this.props.content;
  }

  get messageType(): MessageType {
    return this.props.messageType;
  }

  get fileUrl(): string | null | undefined {
    return this.props.fileUrl;
  }

  get fileName(): string | null | undefined {
    return this.props.fileName;
  }

  get fileSize(): number | null | undefined {
    return this.props.fileSize;
  }

  get isRead(): boolean {
    return this.props.isRead;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  public markAsRead(): void {
    this.props.isRead = true;
  }

  /**
   * Khởi tạo một tin nhắn mới
   */
  public static create(params: {
    id?: string;
    conversationId: ConversationId;
    senderId: UserId;
    content: MessageContent;
    messageType?: MessageType;
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
  }): Message {
    return new Message({
      id: params.id || uuidv4(),
      conversationId: params.conversationId,
      senderId: params.senderId,
      content: params.content,
      messageType: params.messageType || 'text',
      fileUrl: params.fileUrl || null,
      fileName: params.fileName || null,
      fileSize: params.fileSize || null,
      isRead: false,
      createdAt: new Date(),
    });
  }
}
