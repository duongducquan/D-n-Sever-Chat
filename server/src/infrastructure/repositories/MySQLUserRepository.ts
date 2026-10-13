import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserId } from '../../domain/value-objects/UserId';
import { Email } from '../../domain/value-objects/Email';
import { pool } from '../database/mysql.connection';

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar: string;
  status: 'online' | 'offline';
  last_seen: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * TRIỂN KHAI KHO LƯU TRỮ USER BẰNG MYSQL (WampServer)
 * Tuân thủ interface IUserRepository từ tầng Domain.
 */
export class MySQLUserRepository implements IUserRepository {
  private toDomain(row: UserRow): User {
    return new User({
      id: new UserId(row.id),
      username: row.username,
      email: new Email(row.email),
      passwordHash: row.password_hash,
      displayName: row.display_name,
      avatar: row.avatar,
      status: row.status,
      lastSeen: new Date(row.last_seen),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [id.value]
    );
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findByUsername(username: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username.trim()]
    );
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.value]
    );
    if (rows.length === 0) return null;
    return this.toDomain(rows[0]);
  }

  async save(user: User): Promise<void> {
    await pool.query<ResultSetHeader>(
      `INSERT INTO users (id, username, email, password_hash, display_name, avatar, status, last_seen, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id.value,
        user.username,
        user.email.value,
        user.passwordHash,
        user.displayName,
        user.avatar,
        user.status,
        user.lastSeen,
        user.createdAt,
        user.updatedAt,
      ]
    );
  }

  async update(user: User): Promise<void> {
    await pool.query(
      `UPDATE users 
       SET display_name = ?, avatar = ?, status = ?, last_seen = ?, updated_at = ?
       WHERE id = ?`,
      [
        user.displayName,
        user.avatar,
        user.status,
        user.lastSeen,
        user.updatedAt,
        user.id.value,
      ]
    );
  }

  async findAll(excludeUserId?: UserId): Promise<User[]> {
    let sql = 'SELECT * FROM users';
    const params: any[] = [];
    if (excludeUserId) {
      sql += ' WHERE id != ?';
      params.push(excludeUserId.value);
    }
    sql += ' ORDER BY status = "online" DESC, display_name ASC';

    const [rows] = await pool.query<UserRow[]>(sql, params);
    return rows.map((r) => this.toDomain(r));
  }

  async search(keyword: string, excludeUserId?: UserId): Promise<User[]> {
    const term = `%${keyword.trim()}%`;
    let sql = 'SELECT * FROM users WHERE (username LIKE ? OR display_name LIKE ?)';
    const params: any[] = [term, term];
    if (excludeUserId) {
      sql += ' AND id != ?';
      params.push(excludeUserId.value);
    }
    sql += ' ORDER BY display_name ASC LIMIT 20';

    const [rows] = await pool.query<UserRow[]>(sql, params);
    return rows.map((r) => this.toDomain(r));
  }

  async updateStatus(userId: UserId, status: 'online' | 'offline'): Promise<void> {
    await pool.query(
      'UPDATE users SET status = ?, last_seen = NOW(), updated_at = NOW() WHERE id = ?',
      [status, userId.value]
    );
  }
}
