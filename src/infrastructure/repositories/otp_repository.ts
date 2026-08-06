import { Pool, PoolClient } from 'pg';
import { Otp, OtpType } from '../../domain/entities/otp';

export class OtpRepository {
  constructor(private readonly db: Pool) {}

  private getExecutor(client?: PoolClient) {
    return client || this.db;
  }

  async save(otp: Otp, client?: PoolClient): Promise<void> {
    const executor = this.getExecutor(client);
    const query = `
      INSERT INTO otps (id, user_id, email, code, type, expires_at, used, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        used = EXCLUDED.used
    `;
    await executor.query(query, [
      otp.id,
      otp.userId,
      otp.email,
      otp.code,
      otp.type,
      otp.expiresAt,
      otp.used,
      otp.createdAt,
    ]);
  }

  async findLatestUnused(email: string, type: OtpType, client?: PoolClient): Promise<Otp | null> {
    const executor = this.getExecutor(client);
    const query = `
      SELECT * FROM otps 
      WHERE email = $1 AND type = $2 AND used = FALSE 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    const result = await executor.query(query, [email.toLowerCase().trim(), type]);
    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async markAsUsed(id: string, client?: PoolClient): Promise<void> {
    const executor = this.getExecutor(client);
    await executor.query('UPDATE otps SET used = TRUE WHERE id = $1', [id]);
  }

  private mapToDomain(row: any): Otp {
    return new Otp({
      id: row.id,
      userId: row.user_id,
      email: row.email,
      code: row.code,
      type: row.type as OtpType,
      expiresAt: new Date(row.expires_at),
      used: row.used,
      createdAt: new Date(row.created_at),
    });
  }
}
