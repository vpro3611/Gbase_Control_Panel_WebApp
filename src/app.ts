import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import { initContainer, AppContainer } from './container';
import { authMiddleware } from './middlewares/auth_middleware';
import { errorHandler } from './middlewares/error_middleware';

export function createApp(overridePool?: Pool): { app: Express; container: AppContainer } {
  const app = express();
  const container = initContainer(overridePool);
  const c = container.controllers;

  app.use(cors());
  app.use(cookieParser());
  app.use(express.json());

  // Public Config & Auth Routes
  app.get('/api/config/oauth', (_req, res) => {
    res.json({
      googleClientId: process.env.GOOGLE_CLIENT_ID || '',
      githubClientId: process.env.GITHUB_CLIENT_ID || '',
    });
  });

  app.post('/api/auth/register', (req, res, next) => c.registerController.handle(req, res, next));
  app.post('/api/auth/register/verify', (req, res, next) => c.registerVerifyController.handle(req, res, next));
  app.post('/api/auth/login', (req, res, next) => c.loginController.handle(req, res, next));
  app.post('/api/auth/oauth', (req, res, next) => c.oauthLoginController.handle(req, res, next));
  app.post('/api/auth/logout', (req, res, next) => c.logoutController.handle(req, res, next));

  // Authenticated Auth Routes
  app.get('/api/auth/me', authMiddleware, (req, res, next) => c.meController.handle(req, res, next));
  app.post('/api/auth/change-email', authMiddleware, (req, res, next) => c.changeEmailController.handle(req, res, next));
  app.post('/api/auth/change-email/verify', authMiddleware, (req, res, next) => c.changeEmailVerifyController.handle(req, res, next));
  app.post('/api/auth/change-password', authMiddleware, (req, res, next) => c.changePasswordController.handle(req, res, next));
  app.post('/api/auth/change-password/verify', authMiddleware, (req, res, next) => c.changePasswordVerifyController.handle(req, res, next));

  // Authenticated Container Routes
  app.post('/api/containers', authMiddleware, (req, res, next) => c.createContainerController.handle(req, res, next));
  app.get('/api/containers', authMiddleware, (req, res, next) => c.listContainersController.handle(req, res, next));
  app.get('/api/containers/:id', authMiddleware, (req, res, next) => c.getContainerInfoController.handle(req, res, next));
  app.delete('/api/containers/:id', authMiddleware, (req, res, next) => c.deleteContainerController.handle(req, res, next));

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return { app, container };
}
