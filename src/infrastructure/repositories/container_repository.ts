import { Pool, PoolClient } from 'pg';
import { ContainerEntity, ContainerStatus } from '../../domain/entities/container';

export class ContainerRepository {
  constructor(private readonly db: Pool) {}

  private getExecutor(client?: PoolClient) {
    return client || this.db;
  }

  async save(container: ContainerEntity, client?: PoolClient): Promise<void> {
    const executor = this.getExecutor(client);
    const query = `
      INSERT INTO containers (id, user_id, docker_container_id, name, port, connection_string, status, host_info, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        host_info = EXCLUDED.host_info,
        updated_at = EXCLUDED.updated_at
    `;
    await executor.query(query, [
      container.id,
      container.userId,
      container.dockerContainerId,
      container.name,
      container.port,
      container.connectionString,
      container.status,
      container.hostInfo,
      container.createdAt,
      container.updatedAt,
    ]);
  }

  async findById(id: string, client?: PoolClient): Promise<ContainerEntity | null> {
    const executor = this.getExecutor(client);
    const result = await executor.query('SELECT * FROM containers WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return this.mapToDomain(result.rows[0]);
  }

  async findByUserId(userId: string, client?: PoolClient): Promise<ContainerEntity[]> {
    const executor = this.getExecutor(client);
    const result = await executor.query('SELECT * FROM containers WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows.map(row => this.mapToDomain(row));
  }

  async countActiveByUserId(userId: string, client?: PoolClient): Promise<number> {
    const executor = this.getExecutor(client);
    const result = await executor.query(
      "SELECT COUNT(*) FROM containers WHERE user_id = $1 AND status != 'stopped'",
      [userId]
    );
    return parseInt(result.rows[0].count, 10);
  }

  async deleteById(id: string, client?: PoolClient): Promise<void> {
    const executor = this.getExecutor(client);
    await executor.query('DELETE FROM containers WHERE id = $1', [id]);
  }

  private mapToDomain(row: any): ContainerEntity {
    return new ContainerEntity({
      id: row.id,
      userId: row.user_id,
      dockerContainerId: row.docker_container_id,
      name: row.name,
      port: row.port,
      connectionString: row.connection_string,
      status: row.status as ContainerStatus,
      hostInfo: row.host_info,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
