import { RegisterUseCase } from '../../src/use-cases/auth/register_use_case';
import { RegisterVerifyUseCase } from '../../src/use-cases/auth/register_verify_use_case';
import { LoginUseCase } from '../../src/use-cases/auth/login_use_case';
import { OAuthLoginUseCase } from '../../src/use-cases/auth/oauth_login_use_case';
import { User } from '../../src/domain/entities/user';
import { Otp } from '../../src/domain/entities/otp';

describe('Auth Use Cases (Unit Tests)', () => {
  let mockUserRepo: any;
  let mockOtpRepo: any;
  let mockMailerService: any;
  let mockOAuthService: any;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findByGoogleId: jest.fn(),
      findByGithubId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockOtpRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findLatestUnused: jest.fn(),
      markAsUsed: jest.fn().mockResolvedValue(undefined),
    };

    mockMailerService = {
      sendOtpEmail: jest.fn().mockResolvedValue(undefined),
    };

    mockOAuthService = {
      verifyGoogleToken: jest.fn().mockResolvedValue({
        provider: 'google',
        providerId: 'google_12345',
        email: 'oauthuser@gmail.com',
      }),
      verifyGithubToken: jest.fn().mockResolvedValue({
        provider: 'github',
        providerId: 'github_67890',
        email: 'githubuser@github.com',
      }),
    };
  });

  describe('RegisterUseCase', () => {
    it('should throw error if registered user already exists and is verified', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(new User({
        id: 'u1',
        email: 'test@example.com',
        isVerified: true,
      }));

      const useCase = new RegisterUseCase(mockUserRepo, mockOtpRepo, mockMailerService);
      await expect(useCase.execute({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrow('User with this email already exists and is verified');
    });

    it('should create unverified user and send 6-digit OTP code', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const useCase = new RegisterUseCase(mockUserRepo, mockOtpRepo, mockMailerService);
      const res = await useCase.execute({ email: 'newuser@example.com', password: 'password123' });

      expect(res.message).toContain('6-digit OTP');
      expect(mockUserRepo.save).toHaveBeenCalled();
      expect(mockOtpRepo.save).toHaveBeenCalled();
      expect(mockMailerService.sendOtpEmail).toHaveBeenCalledWith(
        'newuser@example.com',
        expect.stringMatching(/^\d{6}$/),
        expect.any(String)
      );
    });
  });

  describe('RegisterVerifyUseCase', () => {
    it('should verify user when 6-digit OTP code is valid', async () => {
      const user = new User({
        id: 'u1',
        email: 'newuser@example.com',
        isVerified: false,
      });
      mockUserRepo.findByEmail.mockResolvedValue(user);

      const validOtp = new Otp({
        id: 'o1',
        userId: 'u1',
        email: 'newuser@example.com',
        code: '123456',
        type: 'REGISTER',
        expiresAt: new Date(Date.now() + 60000),
        used: false,
      });
      mockOtpRepo.findLatestUnused.mockResolvedValue(validOtp);

      const useCase = new RegisterVerifyUseCase(mockUserRepo, mockOtpRepo);
      const res = await useCase.execute({ email: 'newuser@example.com', code: '123456' });

      expect(res.token).toBeDefined();
      expect(res.user.isVerified).toBe(true);
      expect(mockOtpRepo.markAsUsed).toHaveBeenCalledWith('o1', undefined);
    });

    it('should throw error for invalid OTP code', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(new User({
        id: 'u1',
        email: 'newuser@example.com',
        isVerified: false,
      }));

      const validOtp = new Otp({
        id: 'o1',
        userId: 'u1',
        email: 'newuser@example.com',
        code: '123456',
        type: 'REGISTER',
        expiresAt: new Date(Date.now() + 60000),
        used: false,
      });
      mockOtpRepo.findLatestUnused.mockResolvedValue(validOtp);

      const useCase = new RegisterVerifyUseCase(mockUserRepo, mockOtpRepo);
      await expect(useCase.execute({ email: 'newuser@example.com', code: '999999' }))
        .rejects.toThrow('Invalid or expired OTP code');
    });
  });

  describe('OAuthLoginUseCase', () => {
    it('should authenticate user via Google OAuth and return token', async () => {
      mockUserRepo.findByGoogleId.mockResolvedValue(null);
      mockUserRepo.findByEmail.mockResolvedValue(null);

      const useCase = new OAuthLoginUseCase(mockUserRepo, mockOAuthService);
      const res = await useCase.execute({ provider: 'google', tokenOrCode: 'mock_token_123' });

      expect(res.token).toBeDefined();
      expect(res.user.email).toBe('oauthuser@gmail.com');
      expect(mockUserRepo.save).toHaveBeenCalled();
    });
  });
});
