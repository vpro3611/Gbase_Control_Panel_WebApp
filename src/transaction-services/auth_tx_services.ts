import { TransactionManagerInterface } from '../infrastructure/db/transaction_manager_interface';
import { RegisterUseCase, RegisterInput } from '../use-cases/auth/register_use_case';
import { RegisterVerifyUseCase, RegisterVerifyInput } from '../use-cases/auth/register_verify_use_case';
import { LoginUseCase, LoginInput } from '../use-cases/auth/login_use_case';
import { OAuthLoginUseCase, OAuthLoginInput } from '../use-cases/auth/oauth_login_use_case';
import { ChangeEmailUseCase, ChangeEmailInput } from '../use-cases/auth/change_email_use_case';
import { ChangeEmailVerifyUseCase, ChangeEmailVerifyInput } from '../use-cases/auth/change_email_verify_use_case';
import { ChangePasswordUseCase, ChangePasswordInput } from '../use-cases/auth/change_password_use_case';
import { ChangePasswordVerifyUseCase, ChangePasswordVerifyInput } from '../use-cases/auth/change_password_verify_use_case';

export class RegisterTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly registerUseCase: RegisterUseCase
  ) {}

  async execute(input: RegisterInput) {
    return this.txManager.runInTransaction((client) => this.registerUseCase.execute(input, client));
  }
}

export class RegisterVerifyTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly registerVerifyUseCase: RegisterVerifyUseCase
  ) {}

  async execute(input: RegisterVerifyInput) {
    return this.txManager.runInTransaction((client) => this.registerVerifyUseCase.execute(input, client));
  }
}

export class LoginTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly loginUseCase: LoginUseCase
  ) {}

  async execute(input: LoginInput) {
    return this.txManager.runInTransaction((client) => this.loginUseCase.execute(input, client));
  }
}

export class OAuthLoginTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly oauthLoginUseCase: OAuthLoginUseCase
  ) {}

  async execute(input: OAuthLoginInput) {
    return this.txManager.runInTransaction((client) => this.oauthLoginUseCase.execute(input, client));
  }
}

export class ChangeEmailTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly changeEmailUseCase: ChangeEmailUseCase
  ) {}

  async execute(input: ChangeEmailInput) {
    return this.txManager.runInTransaction((client) => this.changeEmailUseCase.execute(input, client));
  }
}

export class ChangeEmailVerifyTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly changeEmailVerifyUseCase: ChangeEmailVerifyUseCase
  ) {}

  async execute(input: ChangeEmailVerifyInput) {
    return this.txManager.runInTransaction((client) => this.changeEmailVerifyUseCase.execute(input, client));
  }
}

export class ChangePasswordTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly changePasswordUseCase: ChangePasswordUseCase
  ) {}

  async execute(input: ChangePasswordInput) {
    return this.txManager.runInTransaction((client) => this.changePasswordUseCase.execute(input, client));
  }
}

export class ChangePasswordVerifyTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly changePasswordVerifyUseCase: ChangePasswordVerifyUseCase
  ) {}

  async execute(input: ChangePasswordVerifyInput) {
    return this.txManager.runInTransaction((client) => this.changePasswordVerifyUseCase.execute(input, client));
  }
}
