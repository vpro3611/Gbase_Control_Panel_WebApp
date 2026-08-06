import { ContainerRepository } from '../../infrastructure/repositories/container_repository';
import { DockerServiceInterface } from '../../infrastructure/docker/docker_service';

export interface DeleteContainerInput {
  containerId: string;
  userId: string;
}

export class DeleteContainerUseCase {
  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly dockerService: DockerServiceInterface
  ) {}

  async execute(input: DeleteContainerInput, dbClient?: any): Promise<{ message: string }> {
    const container = await this.containerRepository.findById(input.containerId, dbClient);
    if (!container || container.userId !== input.userId) {
      throw new Error('Container not found or access denied');
    }

    await this.dockerService.stopAndRemoveContainer(container.dockerContainerId);
    await this.containerRepository.deleteById(container.id, dbClient);

    return { message: 'Container stopped and deleted successfully. Connection string is now invalid.' };
  }
}
