import { Conversation } from '../entities/Conversation';
import { ConversationId } from '../value-objects/ConversationId';
import { UserId } from '../value-objects/UserId';
import { Participant } from '../entities/Participant';

/**
 * GIAO DIỆN KHO LƯU TRỮ (REPOSITORY INTERFACE): IConversationRepository
 * Quản lý hội thoại và người tham gia theo DDD.
 */
export interface IConversationRepository {
  findById(id: ConversationId): Promise<Conversation | null>;
  findDirectConversation(user1: UserId, user2: UserId): Promise<Conversation | null>;
  getUserConversations(userId: UserId): Promise<Conversation[]>;
  save(conversation: Conversation, participantIds: UserId[]): Promise<void>;
  update(conversation: Conversation): Promise<void>;
  addParticipant(conversationId: ConversationId, userId: UserId): Promise<void>;
  getParticipants(conversationId: ConversationId): Promise<Participant[]>;
  isUserInConversation(conversationId: ConversationId, userId: UserId): Promise<boolean>;
}
