import { ValidationError } from '../errors/app_error';

export type OtpType = 'REGISTER' | 'CHANGE_EMAIL' | 'CHANGE_PASSWORD';

export interface OtpProps {
  id: string;
  userId?: string | null;
  email: string;
  code: string;
  type: OtpType;
  expiresAt: Date;
  used?: boolean;
  createdAt?: Date;
}

export class Otp {
  private readonly _id: string;
  private readonly _userId: string | null;
  private readonly _email: string;
  private readonly _code: string;
  private readonly _type: OtpType;
  private readonly _expiresAt: Date;
  private _used: boolean;
  private readonly _createdAt: Date;

  constructor(props: OtpProps) {
    if (!props.code || props.code.length !== 6) {
      throw new ValidationError('OTP code must be exactly 6 characters long');
    }
    this._id = props.id;
    this._userId = props.userId ?? null;
    this._email = props.email.toLowerCase().trim();
    this._code = props.code;
    this._type = props.type;
    this._expiresAt = props.expiresAt;
    this._used = props.used ?? false;
    this._createdAt = props.createdAt || new Date();
  }

  get id(): string { return this._id; }
  get userId(): string | null { return this._userId; }
  get email(): string { return this._email; }
  get code(): string { return this._code; }
  get type(): OtpType { return this._type; }
  get expiresAt(): Date { return this._expiresAt; }
  get used(): boolean { return this._used; }
  get createdAt(): Date { return this._createdAt; }

  public isExpired(now: Date = new Date()): boolean {
    return now.getTime() > this._expiresAt.getTime();
  }

  public isValid(inputCode: string, inputEmail: string, now: Date = new Date()): boolean {
    if (this._used) return false;
    if (this.isExpired(now)) return false;
    if (this._email !== inputEmail.toLowerCase().trim()) return false;
    return this._code === inputCode.trim();
  }

  public markUsed(): void {
    if (this._used) {
      throw new ValidationError('OTP has already been used');
    }
    this._used = true;
  }

  public static generate6DigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
