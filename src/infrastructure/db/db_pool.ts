import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { config } from '../../config/env';

export function createPgPool(): Pool {
  if (config.databaseUrl) {
    const isCloudOrSsl = config.databaseUrl.includes('sslmode=') || 
                         config.databaseUrl.includes('neon.tech') ||
                         config.databaseUrl.includes('amazonaws.com');
    return new Pool({
      connectionString: config.databaseUrl,
      ssl: isCloudOrSsl ? { rejectUnauthorized: false } : false,
    });
  }

  return new Pool({
    host: config.pgHost,
    port: config.pgPort,
    user: config.pgUser,
    password: config.pgPass,
    database: config.pgDb,
  });
}

export async function initDatabase(pool: Pool): Promise<void> {
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
}
