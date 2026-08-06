import { ContainerRepository } from '../../infrastructure/repositories/container_repository';
import { DockerServiceInterface, ContainerInfoDetails } from '../../infrastructure/docker/docker_service';
import { ContainerEntity } from '../../domain/entities/container';
import { NotFoundError } from '../../domain/errors/app_error';

export interface GetContainerInfoInput {
  containerId: string;
  userId: string;
}

export class GetContainerInfoUseCase {
  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly dockerService: DockerServiceInterface
  ) {}

  async execute(input: GetContainerInfoInput, dbClient?: any): Promise<{ container: ContainerEntity; details: ContainerInfoDetails | null }> {
    const container = await this.containerRepository.findById(input.containerId, dbClient);
    if (!container || container.userId !== input.userId) {
      throw new NotFoundError('Container not found or access denied');
    }

    const details = await this.dockerService.getContainerDetails(container.dockerContainerId);
    return {
      container,
      details,
    };
  }
}
