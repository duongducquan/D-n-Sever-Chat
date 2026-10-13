import { v4 as uuidv4 } from 'uuid';

/**
 * LỚP GIÁ TRỊ (VALUE OBJECT): UserId
 * Định danh duy nhất của người dùng trong hệ thống (UUID v4 hoặc số định danh).
 */
export class UserId {
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

  public equals(other: UserId): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
