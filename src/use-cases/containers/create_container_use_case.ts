import { randomUUID } from 'crypto';
import { ContainerRepository } from '../../infrastructure/repositories/container_repository';
import { DockerServiceInterface } from '../../infrastructure/docker/docker_service';
import { ContainerEntity } from '../../domain/entities/container';
import { config } from '../../config/env';
import { ConflictError } from '../../domain/errors/app_error';

export interface CreateContainerInput {
  userId: string;
  name?: string;
}

export class CreateContainerUseCase {
  constructor(
    private readonly containerRepository: ContainerRepository,
    private readonly dockerService: DockerServiceInterface
  ) {}

  async execute(input: CreateContainerInput, dbClient?: any): Promise<ContainerEntity> {
    const activeCount = await this.containerRepository.countActiveByUserId(input.userId, dbClient);
    if (activeCount >= config.maxContainersPerUser) {
      throw new ConflictError(`Maximum allowed container limit reached (max ${config.maxContainersPerUser} per user)`);
    }

    const containerName = input.name || `gobase-instance-${Date.now()}`;
    const dockerResult = await this.dockerService.createAndStartContainer({
      name: containerName,
      userId: input.userId,
    });

    const connectionString = ContainerEntity.buildConnectionString(config.publicHost, dockerResult.port);

    const container = new ContainerEntity({
      id: randomUUID(),
      userId: input.userId,
      dockerContainerId: dockerResult.containerId,
      name: containerName,
      port: dockerResult.port,
      connectionString,
      status: 'running',
      hostInfo: dockerResult.hostInfo,
    });

    await this.containerRepository.save(container, dbClient);
    return container;
  }
}
