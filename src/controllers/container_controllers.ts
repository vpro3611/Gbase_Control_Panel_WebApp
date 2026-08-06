import { Request, Response, NextFunction } from 'express';
import {
  CreateContainerTxService,
  DeleteContainerTxService,
  ListContainersTxService,
  GetContainerInfoTxService
} from '../transaction-services/container_tx_services';

export class CreateContainerController {
  constructor(private readonly service: CreateContainerTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const { name } = req.body;
      const container = await this.service.execute({ userId, name });
      res.status(201).json({
        success: true,
        container: {
          id: container.id,
          name: container.name,
          port: container.port,
          connectionString: container.connectionString,
          status: container.status,
          hostInfo: container.hostInfo,
          createdAt: container.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export class DeleteContainerController {
  constructor(private readonly service: DeleteContainerTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const containerId = req.params.id as string;
      const result = await this.service.execute({ userId, containerId });
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

export class ListContainersController {
  constructor(private readonly service: ListContainersTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const containers = await this.service.execute(userId);
      res.status(200).json({
        success: true,
        containers: containers.map(c => ({
          id: c.id,
          name: c.name,
          port: c.port,
          connectionString: c.connectionString,
          status: c.status,
          hostInfo: c.hostInfo,
          createdAt: c.createdAt,
        })),
      });
    } catch (error) {
      next(error);
    }
  }
}

export class GetContainerInfoController {
  constructor(private readonly service: GetContainerInfoTxService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const containerId = req.params.id as string;
      const result = await this.service.execute({ userId, containerId });
      res.status(200).json({
        success: true,
        container: {
          id: result.container.id,
          name: result.container.name,
          port: result.container.port,
          connectionString: result.container.connectionString,
          status: result.container.status,
          hostInfo: result.container.hostInfo,
          createdAt: result.container.createdAt,
        },
        details: result.details,
      });
    } catch (error) {
      next(error);
    }
  }
}
