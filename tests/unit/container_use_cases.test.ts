import { CreateContainerUseCase } from '../../src/use-cases/containers/create_container_use_case';
import { DeleteContainerUseCase } from '../../src/use-cases/containers/delete_container_use_case';
import { ListContainersUseCase } from '../../src/use-cases/containers/list_containers_use_case';
import { GetContainerInfoUseCase } from '../../src/use-cases/containers/get_container_info_use_case';
import { ContainerEntity } from '../../src/domain/entities/container';

describe('Container Use Cases (Unit Tests)', () => {
  let mockContainerRepo: any;
  let mockDockerService: any;

  beforeEach(() => {
    mockContainerRepo = {
      countActiveByUserId: jest.fn(),
      getAllActivePorts: jest.fn().mockResolvedValue([6381]),
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      deleteById: jest.fn().mockResolvedValue(undefined),
    };

    mockDockerService = {
      createAndStartContainer: jest.fn().mockResolvedValue({
        containerId: 'docker_c123',
        port: 6382,
        hostInfo: 'test-node-1 (4 CPUs, 8192 MB RAM)',
      }),
      stopAndRemoveContainer: jest.fn().mockResolvedValue(undefined),
      getContainerDetails: jest.fn().mockResolvedValue({
        dockerContainerId: 'docker_c123',
        name: 'test-container',
        port: 6382,
        status: 'running',
        hostName: 'test-node-1',
        platform: 'Linux x64',
        cpus: 4,
        totalMemoryMB: 8192,
      }),
    };
  });

  describe('CreateContainerUseCase', () => {
    it('should create container and pass active ports to exclude from allocation', async () => {
      mockContainerRepo.countActiveByUserId.mockResolvedValue(1);
      mockContainerRepo.getAllActivePorts.mockResolvedValue([6381]);

      const useCase = new CreateContainerUseCase(mockContainerRepo, mockDockerService);
      const container = await useCase.execute({ userId: 'u123', name: 'my-gbase-db' });

      expect(container).toBeDefined();
      expect(container.connectionString).toMatch(/^gbase:\/\/u123@.+:6382$/);
      expect(container.port).toBe(6382);
      expect(mockContainerRepo.getAllActivePorts).toHaveBeenCalled();
      expect(mockDockerService.createAndStartContainer).toHaveBeenCalledWith({
        name: 'my-gbase-db',
        userId: 'u123',
        excludePorts: [6381],
      });
      expect(mockContainerRepo.save).toHaveBeenCalled();
    });

    it('should enforce max 3 container limit per user', async () => {
      mockContainerRepo.countActiveByUserId.mockResolvedValue(3);

      const useCase = new CreateContainerUseCase(mockContainerRepo, mockDockerService);
      await expect(useCase.execute({ userId: 'u123', name: 'over-limit-db' }))
        .rejects.toThrow(/Maximum allowed container limit reached/);

      expect(mockDockerService.createAndStartContainer).not.toHaveBeenCalled();
    });
  });

  describe('DeleteContainerUseCase', () => {
    it('should stop and remove Docker container and delete from repo', async () => {
      const container = new ContainerEntity({
        id: 'c1',
        userId: 'u123',
        dockerContainerId: 'docker_c123',
        name: 'my-db',
        port: 6381,
        connectionString: 'gbase://u123@127.0.0.1:6381',
      });
      mockContainerRepo.findById.mockResolvedValue(container);

      const useCase = new DeleteContainerUseCase(mockContainerRepo, mockDockerService);
      const res = await useCase.execute({ containerId: 'c1', userId: 'u123' });

      expect(res.message).toContain('stopped and deleted');
      expect(mockDockerService.stopAndRemoveContainer).toHaveBeenCalledWith('docker_c123');
      expect(mockContainerRepo.deleteById).toHaveBeenCalledWith('c1', undefined);
    });

    it('should throw error if container not owned by user', async () => {
      const container = new ContainerEntity({
        id: 'c1',
        userId: 'other_user',
        dockerContainerId: 'docker_c123',
        name: 'my-db',
        port: 6381,
        connectionString: 'gbase://other_user@127.0.0.1:6381',
      });
      mockContainerRepo.findById.mockResolvedValue(container);

      const useCase = new DeleteContainerUseCase(mockContainerRepo, mockDockerService);
      await expect(useCase.execute({ containerId: 'c1', userId: 'u123' }))
        .rejects.toThrow('Container not found or access denied');
    });
  });
});
