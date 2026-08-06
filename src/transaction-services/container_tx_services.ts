import { TransactionManagerInterface } from '../infrastructure/db/transaction_manager_interface';
import { CreateContainerUseCase, CreateContainerInput } from '../use-cases/containers/create_container_use_case';
import { DeleteContainerUseCase, DeleteContainerInput } from '../use-cases/containers/delete_container_use_case';
import { ListContainersUseCase } from '../use-cases/containers/list_containers_use_case';
import { GetContainerInfoUseCase, GetContainerInfoInput } from '../use-cases/containers/get_container_info_use_case';

export class CreateContainerTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly createContainerUseCase: CreateContainerUseCase
  ) {}

  async execute(input: CreateContainerInput) {
    return this.txManager.runInTransaction((client) => this.createContainerUseCase.execute(input, client));
  }
}

export class DeleteContainerTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly deleteContainerUseCase: DeleteContainerUseCase
  ) {}

  async execute(input: DeleteContainerInput) {
    return this.txManager.runInTransaction((client) => this.deleteContainerUseCase.execute(input, client));
  }
}

export class ListContainersTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly listContainersUseCase: ListContainersUseCase
  ) {}

  async execute(userId: string) {
    return this.txManager.runInTransaction((client) => this.listContainersUseCase.execute(userId, client));
  }
}

export class GetContainerInfoTxService {
  constructor(
    private readonly txManager: TransactionManagerInterface,
    private readonly getContainerInfoUseCase: GetContainerInfoUseCase
  ) {}

  async execute(input: GetContainerInfoInput) {
    return this.txManager.runInTransaction((client) => this.getContainerInfoUseCase.execute(input, client));
  }
}
