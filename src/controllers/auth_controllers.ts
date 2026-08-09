import { Request, Response, NextFunction } from 'express';
import {
  RegisterTxService,
  RegisterVerifyTxService,
  LoginTxService,
  OAuthLoginTxService,
  ChangeEmailTxService,
  ChangeEmailVerifyTxService,
  ChangePasswordTxService,
  ChangePasswordVerifyTxService
} from '../transaction-services/auth_tx_services';

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export class RegisterController {
  constructor(private readonly service: RegisterTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.service.execute({ email, password });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class RegisterVerifyController {
  constructor(private readonly service: RegisterVerifyTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, code } = req.body;
      const result = await this.service.execute({ email, code });
      if (result.token) {
        res.cookie('gbase_token', result.token, COOKIE_OPTIONS);
      }
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class LoginController {
  constructor(private readonly service: LoginTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.service.execute({ email, password });
      if (result.token) {
        res.cookie('gbase_token', result.token, COOKIE_OPTIONS);
      }
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class OAuthLoginController {
  constructor(private readonly service: OAuthLoginTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { provider, tokenOrCode } = req.body;
      const result = await this.service.execute({ provider, tokenOrCode });
      if (result.token) {
        res.cookie('gbase_token', result.token, COOKIE_OPTIONS);
      }
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class MeController {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user;
      res.status(200).json({
        success: true,
        user: {
          id: user.userId,
          email: user.email,
          isVerified: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export class LogoutController {
  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('gbase_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export class ChangeEmailController {
  constructor(private readonly service: ChangeEmailTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { newEmail } = req.body;
      const result = await this.service.execute({ userId, newEmail });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class ChangeEmailVerifyController {
  constructor(private readonly service: ChangeEmailVerifyTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { newEmail, code } = req.body;
      const result = await this.service.execute({ userId, newEmail, code });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class ChangePasswordController {
  constructor(private readonly service: ChangePasswordTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const result = await this.service.execute({ userId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class ChangePasswordVerifyController {
  constructor(private readonly service: ChangePasswordVerifyTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { code, newPassword } = req.body;
      const result = await this.service.execute({ userId, code, newPassword });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
