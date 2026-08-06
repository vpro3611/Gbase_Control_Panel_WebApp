import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { config } from '../../config/env';
import { ForbiddenError, UnauthorizedError } from '../../domain/errors/app_error';

export interface LoginInput {
  email: string;
  password?: string;
}

export class LoginUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: LoginInput, dbClient?: any): Promise<{ token: string; user: { id: string; email: string; isVerified: boolean } }> {
    const user = await this.userRepository.findByEmail(input.email, dbClient);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new ForbiddenError('Email is not verified. Please verify your email first.');
    }

    if (!user.passwordHash || !input.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

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
