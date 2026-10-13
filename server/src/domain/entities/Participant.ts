import { UserId } from '../value-objects/UserId';
import { ConversationId } from '../value-objects/ConversationId';

export interface ParticipantProps {
  id: string;
  conversationId: ConversationId;
  userId: UserId;
  joinedAt: Date;
  lastReadMessageId?: string | null;
}

/**
 * THỰC THỂ (ENTITY): Participant
 * Thành viên tham gia vào một cuộc hội thoại / nhóm chat.
 */
export class Participant {
  private props: ParticipantProps;

  constructor(props: ParticipantProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get conversationId(): ConversationId {
    return this.props.conversationId;
  }

  get userId(): UserId {
    return this.props.userId;
  }

  get joinedAt(): Date {
    return this.props.joinedAt;
  }

  get lastReadMessageId(): string | null | undefined {
    return this.props.lastReadMessageId;
  }

  public updateLastReadMessage(messageId: string): void {
    this.props.lastReadMessageId = messageId;
  }
}
