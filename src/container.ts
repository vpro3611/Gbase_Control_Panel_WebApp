import { Pool } from 'pg';
import { createPgPool } from './infrastructure/db/db_pool';
import { TransactionManager } from './infrastructure/db/transaction_manager';
import { UserRepository } from './infrastructure/repositories/user_repository';
import { OtpRepository } from './infrastructure/repositories/otp_repository';
import { ContainerRepository } from './infrastructure/repositories/container_repository';
import { MailerService } from './infrastructure/mail/mailer_service';
import { OAuthService } from './infrastructure/oauth/oauth_service';
import { DockerService } from './infrastructure/docker/docker_service';

// Use Cases
import { RegisterUseCase } from './use-cases/auth/register_use_case';
import { RegisterVerifyUseCase } from './use-cases/auth/register_verify_use_case';
import { LoginUseCase } from './use-cases/auth/login_use_case';
import { OAuthLoginUseCase } from './use-cases/auth/oauth_login_use_case';
import { ChangeEmailUseCase } from './use-cases/auth/change_email_use_case';
import { ChangeEmailVerifyUseCase } from './use-cases/auth/change_email_verify_use_case';
import { ChangePasswordUseCase } from './use-cases/auth/change_password_use_case';
import { ChangePasswordVerifyUseCase } from './use-cases/auth/change_password_verify_use_case';
import { CreateContainerUseCase } from './use-cases/containers/create_container_use_case';
import { DeleteContainerUseCase } from './use-cases/containers/delete_container_use_case';
import { ListContainersUseCase } from './use-cases/containers/list_containers_use_case';
import { GetContainerInfoUseCase } from './use-cases/containers/get_container_info_use_case';

// TxServices
import {
  RegisterTxService,
  RegisterVerifyTxService,
  LoginTxService,
  OAuthLoginTxService,
  ChangeEmailTxService,
  ChangeEmailVerifyTxService,
  ChangePasswordTxService,
  ChangePasswordVerifyTxService,
} from './transaction-services/auth_tx_services';

import {
  CreateContainerTxService,
  DeleteContainerTxService,
  ListContainersTxService,
  GetContainerInfoTxService,
} from './transaction-services/container_tx_services';

// Controllers
import {
  RegisterController,
  RegisterVerifyController,
  LoginController,
  OAuthLoginController,
  ChangeEmailController,
  ChangeEmailVerifyController,
  ChangePasswordController,
  ChangePasswordVerifyController,
} from './controllers/auth_controllers';

import {
  CreateContainerController,
  DeleteContainerController,
  ListContainersController,
  GetContainerInfoController,
} from './controllers/container_controllers';

export interface AppContainer {
  pool: Pool;
  controllers: {
    registerController: RegisterController;
    registerVerifyController: RegisterVerifyController;
    loginController: LoginController;
    oauthLoginController: OAuthLoginController;
    changeEmailController: ChangeEmailController;
    changeEmailVerifyController: ChangeEmailVerifyController;
    changePasswordController: ChangePasswordController;
    changePasswordVerifyController: ChangePasswordVerifyController;
    createContainerController: CreateContainerController;
    deleteContainerController: DeleteContainerController;
    listContainersController: ListContainersController;
    getContainerInfoController: GetContainerInfoController;
  };
}

export function initContainer(overridePool?: Pool): AppContainer {
  const pool = overridePool || createPgPool();
  const txManager = new TransactionManager(pool);

  // Repositories
  const userRepository = new UserRepository(pool);
  const otpRepository = new OtpRepository(pool);
  const containerRepository = new ContainerRepository(pool);

  // Infrastructure Services
  const mailerService = new MailerService();
  const oauthService = new OAuthService();
  const dockerService = new DockerService();

  // Use Cases
  const registerUseCase = new RegisterUseCase(userRepository, otpRepository, mailerService);
  const registerVerifyUseCase = new RegisterVerifyUseCase(userRepository, otpRepository);
  const loginUseCase = new LoginUseCase(userRepository);
  const oauthLoginUseCase = new OAuthLoginUseCase(userRepository, oauthService);
  const changeEmailUseCase = new ChangeEmailUseCase(userRepository, otpRepository, mailerService);
  const changeEmailVerifyUseCase = new ChangeEmailVerifyUseCase(userRepository, otpRepository);
  const changePasswordUseCase = new ChangePasswordUseCase(userRepository, otpRepository, mailerService);
  const changePasswordVerifyUseCase = new ChangePasswordVerifyUseCase(userRepository, otpRepository);

  const createContainerUseCase = new CreateContainerUseCase(containerRepository, dockerService);
  const deleteContainerUseCase = new DeleteContainerUseCase(containerRepository, dockerService);
  const listContainersUseCase = new ListContainersUseCase(containerRepository);
  const getContainerInfoUseCase = new GetContainerInfoUseCase(containerRepository, dockerService);

  // Transaction Services
  const registerTxService = new RegisterTxService(txManager, registerUseCase);
  const registerVerifyTxService = new RegisterVerifyTxService(txManager, registerVerifyUseCase);
  const loginTxService = new LoginTxService(txManager, loginUseCase);
  const oauthLoginTxService = new OAuthLoginTxService(txManager, oauthLoginUseCase);
  const changeEmailTxService = new ChangeEmailTxService(txManager, changeEmailUseCase);
  const changeEmailVerifyTxService = new ChangeEmailVerifyTxService(txManager, changeEmailVerifyUseCase);
  const changePasswordTxService = new ChangePasswordTxService(txManager, changePasswordUseCase);
  const changePasswordVerifyTxService = new ChangePasswordVerifyTxService(txManager, changePasswordVerifyUseCase);

  const createContainerTxService = new CreateContainerTxService(txManager, createContainerUseCase);
  const deleteContainerTxService = new DeleteContainerTxService(txManager, deleteContainerUseCase);
  const listContainersTxService = new ListContainersTxService(txManager, listContainersUseCase);
  const getContainerInfoTxService = new GetContainerInfoTxService(txManager, getContainerInfoUseCase);

  // Controllers
  const registerController = new RegisterController(registerTxService);
  const registerVerifyController = new RegisterVerifyController(registerVerifyTxService);
  const loginController = new LoginController(loginTxService);
  const oauthLoginController = new OAuthLoginController(oauthLoginTxService);
  const changeEmailController = new ChangeEmailController(changeEmailTxService);
  const changeEmailVerifyController = new ChangeEmailVerifyController(changeEmailVerifyTxService);
  const changePasswordController = new ChangePasswordController(changePasswordTxService);
  const changePasswordVerifyController = new ChangePasswordVerifyController(changePasswordVerifyTxService);

  const createContainerController = new CreateContainerController(createContainerTxService);
  const deleteContainerController = new DeleteContainerController(deleteContainerTxService);
  const listContainersController = new ListContainersController(listContainersTxService);
  const getContainerInfoController = new GetContainerInfoController(getContainerInfoTxService);

  return {
    pool,
    controllers: {
      registerController,
      registerVerifyController,
      loginController,
      oauthLoginController,
      changeEmailController,
      changeEmailVerifyController,
      changePasswordController,
      changePasswordVerifyController,
      createContainerController,
      deleteContainerController,
      listContainersController,
      getContainerInfoController,
    },
  };
}
