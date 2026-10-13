import { v4 as uuidv4 } from 'uuid';

/**
 * LỚP GIÁ TRỊ (VALUE OBJECT): ConversationId
 * Định danh duy nhất của phòng chat / cuộc hội thoại.
 */
export class ConversationId {
  private readonly _value: string;

  constructor(value?: string) {
    if (value && value.trim().length > 0) {
      this._value = value.trim();
    } else {
      this._value = uuidv4();
    }
  }

  get value(): string {
    return this._value;
  }

  public equals(other: ConversationId): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
