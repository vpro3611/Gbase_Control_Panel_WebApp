import http from 'http';
import { createApp } from './app';
import { config } from './config/env';
import { initDatabase } from './infrastructure/db/db_pool';

export async function startServer(): Promise<http.Server> {
  const { app, container } = createApp();

  try {
    await initDatabase(container.pool);
    console.log('[DB] Database schema initialized successfully');
  } catch (err) {
    console.warn('[DB] Warning during schema init:', (err as Error).message);
  }

  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(config.port, () => {
      console.log(`[GObase CP Backend] Server listening on port ${config.port}`);
      resolve(server);
    });
  });
}
