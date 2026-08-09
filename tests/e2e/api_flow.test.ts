import request from 'supertest';
import { createApp } from '../../src/app';
import { OAuthService } from '../../src/infrastructure/oauth/oauth_service';
import { MailerService } from '../../src/infrastructure/mail/mailer_service';

describe('GObase Control Panel E2E API Flow (Supertest)', () => {
  let app: any;
  let authToken: string;
  let createdContainerId: string;
  const memoryDb: Record<string, any[]> = {
    users: [],
    otps: [],
    containers: [],
  };
  const testEmail = `e2e_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  beforeAll(() => {
    jest.spyOn(MailerService.prototype, 'sendOtpEmail').mockResolvedValue();
    jest.spyOn(OAuthService.prototype, 'verifyGoogleToken').mockResolvedValue({
      provider: 'google',
      providerId: 'google_123456789',
      email: testEmail,
    });

    const mockPool: any = {
      connect: jest.fn().mockResolvedValue({
        query: jest.fn(async (text: string, params: any[]) => {
          const lower = text.toLowerCase().trim();
          if (lower.startsWith('begin') || lower.startsWith('commit') || lower.startsWith('rollback')) {
            return { rows: [] };
          }
          if (lower.includes('insert into users')) {
            const userObj = {
              id: params[0],
              email: params[1],
              password_hash: params[2],
              is_verified: params[3],
              google_id: params[4],
              github_id: params[5],
              created_at: params[6],
              updated_at: params[7],
            };
            const idx = memoryDb.users.findIndex(u => u.id === userObj.id || u.email === userObj.email);
            if (idx >= 0) memoryDb.users[idx] = userObj;
            else memoryDb.users.push(userObj);
            return { rows: [] };
          }
          if (lower.includes('select * from users where email')) {
            const found = memoryDb.users.find(u => u.email === params[0]);
            return { rows: found ? [found] : [] };
          }
          if (lower.includes('select * from users where id')) {
            const found = memoryDb.users.find(u => u.id === params[0]);
            return { rows: found ? [found] : [] };
          }
          if (lower.includes('select * from users where google_id')) {
            const found = memoryDb.users.find(u => u.google_id === params[0]);
            return { rows: found ? [found] : [] };
          }
          if (lower.includes('select * from users where github_id')) {
            const found = memoryDb.users.find(u => u.github_id === params[0]);
            return { rows: found ? [found] : [] };
          }
          if (lower.includes('insert into otps')) {
            const otpObj = {
              id: params[0],
              user_id: params[1],
              email: params[2],
              code: params[3],
              type: params[4],
              expires_at: params[5],
              used: params[6],
              created_at: params[7],
            };
            memoryDb.otps.push(otpObj);
            return { rows: [] };
          }
          if (lower.includes('select * from otps')) {
            const found = memoryDb.otps
              .filter(o => o.email === params[0] && o.type === params[1] && !o.used)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
            return { rows: found ? [found] : [] };
          }
          if (lower.includes('update otps set used')) {
            const found = memoryDb.otps.find(o => o.id === params[0]);
            if (found) found.used = true;
            return { rows: [] };
          }
          if (lower.includes('insert into containers')) {
            const cObj = {
              id: params[0],
              user_id: params[1],
              docker_container_id: params[2],
              name: params[3],
              port: params[4],
              connection_string: params[5],
              status: params[6],
              host_info: params[7],
              created_at: params[8],
              updated_at: params[9],
            };
            const idx = memoryDb.containers.findIndex(c => c.id === cObj.id);
            if (idx >= 0) memoryDb.containers[idx] = cObj;
            else memoryDb.containers.push(cObj);
            return { rows: [] };
          }
          if (lower.includes('select count(*) from containers')) {
            const count = memoryDb.containers.filter(c => c.user_id === params[0] && c.status !== 'stopped').length;
            return { rows: [{ count: count.toString() }] };
          }
          if (lower.includes('select * from containers where user_id')) {
            const list = memoryDb.containers.filter(c => c.user_id === params[0]);
            return { rows: list };
          }
          if (lower.includes('select * from containers where id')) {
            const found = memoryDb.containers.find(c => c.id === params[0]);
            return { rows: found ? [found] : [] };
          }
          if (lower.includes('delete from containers')) {
            memoryDb.containers = memoryDb.containers.filter(c => c.id !== params[0]);
            return { rows: [] };
          }
          return { rows: [] };
        }),
        release: jest.fn(),
      }),
      query: jest.fn(async (text: string, params: any[]) => {
        const client = await mockPool.connect();
        return client.query(text, params);
      }),
    };

    const setup = createApp(mockPool);
    app = setup.app;
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('Step 1: Auth Endpoints', () => {
    it('POST /api/auth/register - should register user and return OTP message', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('6-digit OTP');
    });

    it('POST /api/auth/register/verify - should verify OTP and return JWT token', async () => {
      const sentOtp = memoryDb.otps.find(o => o.email === testEmail && o.type === 'REGISTER');
      expect(sentOtp).toBeDefined();

      const verifyRes = await request(app)
        .post('/api/auth/register/verify')
        .send({ email: testEmail, code: sentOtp.code });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.token).toBeDefined();
      authToken = verifyRes.body.token;
    });

    it('POST /api/auth/oauth - should authenticate via Google OAuth', async () => {
      const res = await request(app)
        .post('/api/auth/oauth')
        .send({ provider: 'google', tokenOrCode: 'valid_google_token' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });

  describe('Step 2: Container Endpoints', () => {
    it('POST /api/containers - should create a container with gbase:// connection string', async () => {
      const res = await request(app)
        .post('/api/containers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'production-kv-store' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.container.connectionString).toMatch(/^gbase:\/\/.+@.+:\d+$/);
      expect(res.body.container.port).toBeGreaterThan(0);
      createdContainerId = res.body.container.id;
    });

    it('GET /api/containers - should list user containers', async () => {
      const res = await request(app)
        .get('/api/containers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.containers.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/containers/:id - should return basic container info & host specs', async () => {
      const res = await request(app)
        .get(`/api/containers/${createdContainerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.container.id).toBe(createdContainerId);
      expect(res.body.details).toBeDefined();
    });

    it('POST /api/containers - should enforce 3 container limit', async () => {
      await request(app).post('/api/containers').set('Authorization', `Bearer ${authToken}`).send({ name: 'c2' });
      await request(app).post('/api/containers').set('Authorization', `Bearer ${authToken}`).send({ name: 'c3' });

      const res = await request(app)
        .post('/api/containers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'c4_over_limit' });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Maximum allowed container limit/);
    });

    it('DELETE /api/containers/:id - should delete container and invalidate string', async () => {
      const res = await request(app)
        .delete(`/api/containers/${createdContainerId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('stopped and deleted');
    });
  });
});
