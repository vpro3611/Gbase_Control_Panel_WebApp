import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { OtpRepository } from '../../infrastructure/repositories/otp_repository';
import { config } from '../../config/env';

export interface RegisterVerifyInput {
  email: string;
  code: string;
}

export class RegisterVerifyUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository
  ) {}

  async execute(input: RegisterVerifyInput, dbClient?: any): Promise<{ token: string; user: { id: string; email: string; isVerified: boolean } }> {
    const user = await this.userRepository.findByEmail(input.email, dbClient);
    if (!user) {
      throw new Error('User not found');
    }

    const otp = await this.otpRepository.findLatestUnused(input.email, 'REGISTER', dbClient);
    if (!otp || !otp.isValid(input.code, input.email)) {
      throw new Error('Invalid or expired OTP code');
    }

    otp.markUsed();
    await this.otpRepository.markAsUsed(otp.id, dbClient);

    user.verifyEmail();
    await this.userRepository.save(user, dbClient);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
      },
    };
  }
}
