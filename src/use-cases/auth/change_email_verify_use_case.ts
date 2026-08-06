import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { OtpRepository } from '../../infrastructure/repositories/otp_repository';
import { NotFoundError, ValidationError } from '../../domain/errors/app_error';

export interface ChangeEmailVerifyInput {
  userId: string;
  newEmail: string;
  code: string;
}

export class ChangeEmailVerifyUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository
  ) {}

  async execute(input: ChangeEmailVerifyInput, dbClient?: any): Promise<{ message: string; email: string }> {
    const user = await this.userRepository.findById(input.userId, dbClient);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const otp = await this.otpRepository.findLatestUnused(input.newEmail, 'CHANGE_EMAIL', dbClient);
    if (!otp || !otp.isValid(input.code, input.newEmail)) {
      throw new ValidationError('Invalid or expired OTP code');
    }

    otp.markUsed();
    await this.otpRepository.markAsUsed(otp.id, dbClient);

    user.updateEmail(input.newEmail);
    await this.userRepository.save(user, dbClient);

    return {
      message: 'Email address updated successfully',
      email: user.email,
    };
  }
}
