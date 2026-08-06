import { randomUUID } from 'crypto';
import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { OtpRepository } from '../../infrastructure/repositories/otp_repository';
import { MailerServiceInterface } from '../../infrastructure/mail/mailer_service';
import { Otp } from '../../domain/entities/otp';
import { NotFoundError } from '../../domain/errors/app_error';

export interface ChangePasswordInput {
  userId: string;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly mailerService: MailerServiceInterface
  ) {}

  async execute(input: ChangePasswordInput, dbClient?: any): Promise<{ message: string }> {
    const user = await this.userRepository.findById(input.userId, dbClient);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const code = Otp.generate6DigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otp = new Otp({
      id: randomUUID(),
      userId: user.id,
      email: user.email,
      code,
      type: 'CHANGE_PASSWORD',
      expiresAt,
    });

    await this.otpRepository.save(otp, dbClient);
    await this.mailerService.sendOtpEmail(user.email, code, 'GObase Control Panel - Password Change OTP Code');

    return { message: '6-digit OTP code sent to your email' };
  }
}
