import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { OtpRepository } from '../../infrastructure/repositories/otp_repository';
import { MailerServiceInterface } from '../../infrastructure/mail/mailer_service';
import { User } from '../../domain/entities/user';
import { Otp } from '../../domain/entities/otp';

export interface RegisterInput {
  email: string;
  password?: string;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly mailerService: MailerServiceInterface
  ) {}

  async execute(input: RegisterInput, dbClient?: any): Promise<{ message: string; userId: string }> {
    const existingUser = await this.userRepository.findByEmail(input.email, dbClient);
    let userId: string;

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new Error('User with this email already exists and is verified');
      }
      userId = existingUser.id;
      if (input.password) {
        const passwordHash = await bcrypt.hash(input.password, 10);
        existingUser.updatePassword(passwordHash);
        await this.userRepository.save(existingUser, dbClient);
      }
    } else {
      if (!input.password || input.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      const passwordHash = await bcrypt.hash(input.password, 10);
      userId = randomUUID();
      const newUser = new User({
        id: userId,
        email: input.email,
        passwordHash,
        isVerified: false,
      });
      await this.userRepository.save(newUser, dbClient);
    }

    const code = Otp.generate6DigitCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const otp = new Otp({
      id: randomUUID(),
      userId,
      email: input.email,
      code,
      type: 'REGISTER',
      expiresAt,
    });

    await this.otpRepository.save(otp, dbClient);
    await this.mailerService.sendOtpEmail(input.email, code, 'GObase Control Panel - Registration OTP Code');

    return {
      message: 'Verification 6-digit OTP sent to email',
      userId,
    };
  }
}
