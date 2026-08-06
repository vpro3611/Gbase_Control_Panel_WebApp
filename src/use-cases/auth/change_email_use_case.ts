import { randomUUID } from 'crypto';
import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { OtpRepository } from '../../infrastructure/repositories/otp_repository';
import { MailerServiceInterface } from '../../infrastructure/mail/mailer_service';
import { Otp } from '../../domain/entities/otp';

export interface ChangeEmailInput {
  userId: string;
  newEmail: string;
}

export class ChangeEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly mailerService: MailerServiceInterface
  ) {}

  async execute(input: ChangeEmailInput, dbClient?: any): Promise<{ message: string }> {
    const user = await this.userRepository.findById(input.userId, dbClient);
    if (!user) {
      throw new Error('User not found');
    }

    const existingEmailUser = await this.userRepository.findByEmail(input.newEmail, dbClient);
    if (existingEmailUser && existingEmailUser.id !== user.id) {
      throw new Error('This email address is already in use by another account');
    }

    const code = Otp.generate6DigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const otp = new Otp({
      id: randomUUID(),
      userId: user.id,
      email: input.newEmail,
      code,
      type: 'CHANGE_EMAIL',
      expiresAt,
    });

    await this.otpRepository.save(otp, dbClient);
    await this.mailerService.sendOtpEmail(input.newEmail, code, 'GObase Control Panel - Email Change Verification OTP');

    return { message: '6-digit OTP code sent to your new email address' };
  }
}
