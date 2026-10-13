/**
 * LỚP GIÁ TRỊ (VALUE OBJECT): Email
 * Đại diện cho địa chỉ Email hợp lệ theo tiêu chuẩn nghiệp vụ trong DDD.
 * Bất biến (Immutable) và tự kiểm tra tính hợp lệ khi khởi tạo.
 */
export class Email {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value ? value.trim().toLowerCase() : '';
    if (!this.validate(trimmed)) {
      throw new Error(`Địa chỉ email không hợp lệ: "${value}"`);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  private validate(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  public equals(other: Email): boolean {
    return this._value === other.value;
  }
}
