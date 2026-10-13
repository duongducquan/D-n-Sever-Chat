/**
 * LỚP GIÁ TRỊ (VALUE OBJECT): MessageContent
 * Đảm bảo nội dung tin nhắn không bị rỗng, an toàn, đã làm sạch khoảng trắng.
 */
export class MessageContent {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value ? value.trim() : '';
    if (trimmed.length === 0) {
      throw new Error('Nội dung tin nhắn không được để trống.');
    }
    if (trimmed.length > 5000) {
      throw new Error('Nội dung tin nhắn không được vượt quá 5000 ký tự.');
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  public toString(): string {
    return this._value;
  }
}
