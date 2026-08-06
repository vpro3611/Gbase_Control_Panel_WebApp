import { Pool, PoolClient } from 'pg';
import { User, UserProps } from '../../domain/entities/user';

export class UserRepository {
  constructor(private readonly db: Pool) {}

  private getExecutor(client?: PoolClient) {
    return client || this.db;
  }

  async save(user: User, client?: PoolClient): Promise<void> {
    const executor = this.getExecutor(client);
    const query = `
      INSERT INTO users (id, email, password_hash, is_verified, google_id, github_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        is_verified = EXCLUDED.is_verified,
        google_id = EXCLUDED.google_id,
        github_id = EXCLUDED.github_id,
        updated_at = EXCLUDED.updated_at
    `;
    await executor.query(query, [
      user.id,
      user.email,
      user.passwordHash,
      user.isVerified,
      user.googleId,
      user.githubId,
      user.createdAt,
      user.updatedAt,
    ]);
  }

  async findById(id: string, client?: PoolClient): Promise<User | null> {
    const executor = this.getExecutor(client);
    const result = await executor.query('SELECT * FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByEmail(email: string, client?: PoolClient): Promise<User | null> {
    const executor = this.getExecutor(client);
    const result = await executor.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByGoogleId(googleId: string, client?: PoolClient): Promise<User | null> {
    const executor = this.getExecutor(client);
    const result = await executor.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByGithubId(githubId: string, client?: PoolClient): Promise<User | null> {
    const executor = this.getExecutor(client);
    const result = await executor.query('SELECT * FROM users WHERE github_id = $1', [githubId]);
    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async deleteById(id: string, client?: PoolClient): Promise<void> {
    const executor = this.getExecutor(client);
    await executor.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private mapToDomain(row: any): User {
    return new User({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      isVerified: row.is_verified,
      googleId: row.google_id,
      githubId: row.github_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
