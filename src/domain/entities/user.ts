import { ValidationError } from '../errors/app_error';

export interface UserProps {
  id: string;
  email: string;
  passwordHash?: string | null;
  isVerified: boolean;
  googleId?: string | null;
  githubId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private readonly _id: string;
  private _email: string;
  private _passwordHash: string | null;
  private _isVerified: boolean;
  private _googleId: string | null;
  private _githubId: string | null;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: UserProps) {
    if (!props.email || !props.email.includes('@')) {
      throw new ValidationError('Invalid user email address format');
    }
    this._id = props.id;
    this._email = props.email.toLowerCase().trim();
    this._passwordHash = props.passwordHash ?? null;
    this._isVerified = props.isVerified;
    this._googleId = props.googleId ?? null;
    this._githubId = props.githubId ?? null;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  get id(): string { return this._id; }
  get email(): string { return this._email; }
  get passwordHash(): string | null { return this._passwordHash; }
  get isVerified(): boolean { return this._isVerified; }
  get googleId(): string | null { return this._googleId; }
  get githubId(): string | null { return this._githubId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  public verifyEmail(): void {
    this._isVerified = true;
    this._updatedAt = new Date();
  }

  public updateEmail(newEmail: string): void {
    if (!newEmail || !newEmail.includes('@')) {
      throw new ValidationError('Invalid email address format');
    }
    this._email = newEmail.toLowerCase().trim();
    this._updatedAt = new Date();
  }

  public updatePassword(newPasswordHash: string): void {
    if (!newPasswordHash) {
      throw new ValidationError('Password hash cannot be empty');
    }
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  public setGoogleId(googleId: string): void {
    this._googleId = googleId;
    this._updatedAt = new Date();
  }

  public setGithubId(githubId: string): void {
    this._githubId = githubId;
    this._updatedAt = new Date();
  }
}
