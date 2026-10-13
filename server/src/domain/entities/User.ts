import { UserId } from '../value-objects/UserId';
import { Email } from '../value-objects/Email';

export interface UserProps {
  id: UserId;
  username: string;
  email: Email;
  passwordHash: string;
  displayName: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * THỰC THỂ (ENTITY) & AGGREGATE ROOT: User
 * Đại diện cho người dùng trong miền nghiệp vụ Chat (DDD).
 */
export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  get id(): UserId {
    return this.props.id;
  }

  get username(): string {
    return this.props.username;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get avatar(): string {
    return this.props.avatar;
  }

  get status(): 'online' | 'offline' {
    return this.props.status;
  }

  get lastSeen(): Date {
    return this.props.lastSeen;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  /**
   * Cập nhật trạng thái trực tuyến / ngoại tuyến
   */
  public updateStatus(status: 'online' | 'offline'): void {
    this.props.status = status;
    this.props.lastSeen = new Date();
    this.props.updatedAt = new Date();
  }

  /**
   * Cập nhật thông tin hồ sơ
   */
  public updateProfile(displayName?: string, avatar?: string): void {
    if (displayName) this.props.displayName = displayName.trim();
    if (avatar) this.props.avatar = avatar.trim();
    this.props.updatedAt = new Date();
  }

  /**
   * Phương thức tạo nhanh người dùng mới (Factory Method)
   */
  public static create(params: {
    id?: UserId;
    username: string;
    email: Email;
    passwordHash: string;
    displayName?: string;
    avatar?: string;
  }): User {
    const now = new Date();
    const displayName = params.displayName || params.username;
    // Tạo avatar mặc định đẹp mắt hoàn toàn miễn phí từ UI Avatars / DiceBear SVG
    const defaultAvatar =
      params.avatar ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(params.username)}`;

    return new User({
      id: params.id || new UserId(),
      username: params.username.trim(),
      email: params.email,
      passwordHash: params.passwordHash,
      displayName,
      avatar: defaultAvatar,
      status: 'offline',
      lastSeen: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}
