import { ConversationId } from '../value-objects/ConversationId';
import { UserId } from '../value-objects/UserId';
import { Participant } from './Participant';

export interface ConversationProps {
  id: ConversationId;
  title: string;
  isGroup: boolean;
  createdBy: UserId;
  createdAt: Date;
  updatedAt: Date;
  lastMessageId?: string | null;
  participants?: Participant[];
}

/**
 * THỰC THỂ GỐC (AGGREGATE ROOT): Conversation
 * Đại diện cho cuộc trò chuyện 1-1 hoặc nhóm chat trong mô hình DDD.
 */
export class Conversation {
  private props: ConversationProps;

  constructor(props: ConversationProps) {
    this.props = props;
  }

  get id(): ConversationId {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get isGroup(): boolean {
    return this.props.isGroup;
  }

  get createdBy(): UserId {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get lastMessageId(): string | null | undefined {
    return this.props.lastMessageId;
  }

  get participants(): Participant[] {
    return this.props.participants || [];
  }

  public setParticipants(participants: Participant[]): void {
    this.props.participants = participants;
  }

  public updateLastMessage(messageId: string): void {
    this.props.lastMessageId = messageId;
    this.props.updatedAt = new Date();
  }

  public rename(newTitle: string): void {
    if (!this.props.isGroup) {
      throw new Error('Chỉ có thể đổi tên nhóm chat.');
    }
    this.props.title = newTitle.trim();
    this.props.updatedAt = new Date();
  }

  /**
   * Phương thức khởi tạo Cuộc hội thoại (Factory Method)
   */
  public static create(params: {
    id?: ConversationId;
    title?: string;
    isGroup: boolean;
    createdBy: UserId;
  }): Conversation {
    const now = new Date();
    return new Conversation({
      id: params.id || new ConversationId(),
      title: params.title || (params.isGroup ? 'Nhóm trò chuyện mới' : 'Trò chuyện riêng tư'),
      isGroup: params.isGroup,
      createdBy: params.createdBy,
      createdAt: now,
      updatedAt: now,
      participants: [],
    });
  }
}
