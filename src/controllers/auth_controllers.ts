import { Request, Response } from 'express';
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

export class RegisterController {
  constructor(private readonly service: RegisterTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.service.execute({ email, password });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export class RegisterVerifyController {
  constructor(private readonly service: RegisterVerifyTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;
      const result = await this.service.execute({ email, code });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export class LoginController {
  constructor(private readonly service: LoginTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const result = await this.service.execute({ email, password });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export class OAuthLoginController {
  constructor(private readonly service: OAuthLoginTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const { provider, tokenOrCode } = req.body;
      const result = await this.service.execute({ provider, tokenOrCode });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export class ChangeEmailController {
  constructor(private readonly service: ChangeEmailTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { newEmail } = req.body;
      const result = await this.service.execute({ userId, newEmail });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export class ChangeEmailVerifyController {
  constructor(private readonly service: ChangeEmailVerifyTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { newEmail, code } = req.body;
      const result = await this.service.execute({ userId, newEmail, code });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export class ChangePasswordController {
  constructor(private readonly service: ChangePasswordTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const result = await this.service.execute({ userId });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}

export class ChangePasswordVerifyController {
  constructor(private readonly service: ChangePasswordVerifyTxService) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { code, newPassword } = req.body;
      const result = await this.service.execute({ userId, code, newPassword });
      res.status(200).json({ success: true, ...result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
