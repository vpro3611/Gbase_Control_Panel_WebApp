import bcrypt from 'bcryptjs';
import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { OtpRepository } from '../../infrastructure/repositories/otp_repository';

export interface ChangePasswordVerifyInput {
  userId: string;
  code: string;
  newPassword?: string;
}

export class ChangePasswordVerifyUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository
  ) {}

  async execute(input: ChangePasswordVerifyInput, dbClient?: any): Promise<{ message: string }> {
    if (!input.newPassword || input.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    const user = await this.userRepository.findById(input.userId, dbClient);
    if (!user) {
      throw new Error('User not found');
    }

    const otp = await this.otpRepository.findLatestUnused(user.email, 'CHANGE_PASSWORD', dbClient);
    if (!otp || !otp.isValid(input.code, user.email)) {
      throw new Error('Invalid or expired OTP code');
    }

    otp.markUsed();
    await this.otpRepository.markAsUsed(otp.id, dbClient);

    const passwordHash = await bcrypt.hash(input.newPassword, 10);
    user.updatePassword(passwordHash);
    await this.userRepository.save(user, dbClient);

    return { message: 'Password updated successfully' };
  }
}
