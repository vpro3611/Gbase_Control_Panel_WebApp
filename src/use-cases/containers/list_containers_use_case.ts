import { ContainerRepository } from '../../infrastructure/repositories/container_repository';
import { ContainerEntity } from '../../domain/entities/container';

export class ListContainersUseCase {
  constructor(private readonly containerRepository: ContainerRepository) {}

  async execute(userId: string, dbClient?: any): Promise<ContainerEntity[]> {
    return this.containerRepository.findByUserId(userId, dbClient);
  }
}
