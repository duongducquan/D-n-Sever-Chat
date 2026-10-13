/**
 * GIAO DIỆN SỰ KIỆN NGHIỆP VỤ (DOMAIN EVENT INTERFACE)
 * Dùng để phát các sự kiện trong hệ thống (như gửi tin nhắn, người dùng online/offline)
 */
export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId(): string;
}
