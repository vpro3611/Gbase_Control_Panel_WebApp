import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../../infrastructure/repositories/user_repository';
import { OAuthServiceInterface } from '../../infrastructure/oauth/oauth_service';
import { User } from '../../domain/entities/user';
import { config } from '../../config/env';

export interface OAuthLoginInput {
  provider: 'google' | 'github';
  tokenOrCode: string;
}

export class OAuthLoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly oauthService: OAuthServiceInterface
  ) {}

  async execute(input: OAuthLoginInput, dbClient?: any): Promise<{ token: string; user: { id: string; email: string; isVerified: boolean } }> {
    const profile = input.provider === 'google'
      ? await this.oauthService.verifyGoogleToken(input.tokenOrCode)
      : await this.oauthService.verifyGithubToken(input.tokenOrCode);

    let user = input.provider === 'google'
      ? await this.userRepository.findByGoogleId(profile.providerId, dbClient)
      : await this.userRepository.findByGithubId(profile.providerId, dbClient);

    if (!user) {
      user = await this.userRepository.findByEmail(profile.email, dbClient);
      if (user) {
        if (input.provider === 'google') user.setGoogleId(profile.providerId);
        if (input.provider === 'github') user.setGithubId(profile.providerId);
        user.verifyEmail();
        await this.userRepository.save(user, dbClient);
      } else {
        const userId = randomUUID();
        user = new User({
          id: userId,
          email: profile.email,
          isVerified: true,
          googleId: input.provider === 'google' ? profile.providerId : null,
          githubId: input.provider === 'github' ? profile.providerId : null,
        });
        await this.userRepository.save(user, dbClient);
      }
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
