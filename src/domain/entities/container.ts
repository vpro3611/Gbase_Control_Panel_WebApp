import { ValidationError } from '../errors/app_error';

export type ContainerStatus = 'running' | 'stopped' | 'error';

export interface ContainerProps {
  id: string;
  userId: string;
  dockerContainerId: string;
  name: string;
  port: number;
  connectionString: string;
  status?: ContainerStatus;
  hostInfo?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ContainerEntity {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _dockerContainerId: string;
  private readonly _name: string;
  private readonly _port: number;
  private readonly _connectionString: string;
  private _status: ContainerStatus;
  private _hostInfo: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: ContainerProps) {
    if (!props.id || !props.userId || !props.dockerContainerId) {
      throw new ValidationError('Invalid container parameters');
    }
    this._id = props.id;
    this._userId = props.userId;
    this._dockerContainerId = props.dockerContainerId;
    this._name = props.name;
    this._port = props.port;
    this._connectionString = props.connectionString;
    this._status = props.status || 'running';
    this._hostInfo = props.hostInfo ?? null;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): string { return this._id; }
  get userId(): string { return this._userId; }
  get dockerContainerId(): string { return this._dockerContainerId; }
  get name(): string { return this._name; }
  get port(): number { return this._port; }
  get connectionString(): string { return this._connectionString; }
  get status(): ContainerStatus { return this._status; }
  get hostInfo(): string | null { return this._hostInfo; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  public setStatus(status: ContainerStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }

  public setHostInfo(info: string): void {
    this._hostInfo = info;
    this._updatedAt = new Date();
  }

  public static buildConnectionString(host: string, port: number): string {
    return `gbase://${host}:${port}`;
  }
}
