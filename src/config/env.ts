import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface Config {
  port: number;
  databaseUrl?: string;
  pgHost: string;
  pgPort: number;
  pgUser: string;
  pgPass: string;
  pgDb: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  maxContainersPerUser: number;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  googleClientId: string;
  googleClientSecret: string;
  githubClientId: string;
  githubClientSecret: string;
  publicHost: string;
  gobaseDockerImage: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: process.env.DATABASE_URL,
  pgHost: process.env.PGHOST || 'localhost',
  pgPort: parseInt(process.env.PGPORT || '5432', 10),
  pgUser: process.env.PGUSER || 'postgres',
  pgPass: process.env.PGPASSWORD || 'postgres',
  pgDb: process.env.PGDATABASE || 'gbase_cp',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  maxContainersPerUser: parseInt(process.env.MAX_CONTAINERS_PER_USER || '3', 10),
  smtpHost: process.env.SMTP_HOST || 'localhost',
  smtpPort: parseInt(process.env.SMTP_PORT || '1025', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || '',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  githubClientId: process.env.GITHUB_CLIENT_ID || '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  publicHost: process.env.PUBLIC_HOST || '127.0.0.1',
  gobaseDockerImage: process.env.GOBASE_DOCKER_IMAGE || 'gobase-server:latest',
};
