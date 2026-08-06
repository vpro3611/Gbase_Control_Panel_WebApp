import express, { Express } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import { initContainer, AppContainer } from './container';
import { authMiddleware } from './middlewares/auth_middleware';

export function createApp(overridePool?: Pool): { app: Express; container: AppContainer } {
  const app = express();
  const container = initContainer(overridePool);
  const c = container.controllers;

  app.use(cors());
  app.use(express.json());

  // Public Config & Auth Routes
  app.get('/api/config/oauth', (_req, res) => {
    res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      githubClientId: process.env.GITHUB_CLIENT_ID || '',
    });
  });

  app.post('/api/auth/register', (req, res) => c.registerController.handle(req, res));
  app.post('/api/auth/register/verify', (req, res) => c.registerVerifyController.handle(req, res));
  app.post('/api/auth/login', (req, res) => c.loginController.handle(req, res));
  app.post('/api/auth/oauth', (req, res) => c.oauthLoginController.handle(req, res));

  // Authenticated Auth Routes
  app.post('/api/auth/change-email', authMiddleware, (req, res) => c.changeEmailController.handle(req, res));
  app.post('/api/auth/change-email/verify', authMiddleware, (req, res) => c.changeEmailVerifyController.handle(req, res));
  app.post('/api/auth/change-password', authMiddleware, (req, res) => c.changePasswordController.handle(req, res));
  app.post('/api/auth/change-password/verify', authMiddleware, (req, res) => c.changePasswordVerifyController.handle(req, res));

  // Authenticated Container Routes
  app.post('/api/containers', authMiddleware, (req, res) => c.createContainerController.handle(req, res));
  app.get('/api/containers', authMiddleware, (req, res) => c.listContainersController.handle(req, res));
  app.get('/api/containers/:id', authMiddleware, (req, res) => c.getContainerInfoController.handle(req, res));
  app.delete('/api/containers/:id', authMiddleware, (req, res) => c.deleteContainerController.handle(req, res));

  return { app, container };
}
