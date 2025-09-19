import { User } from '../../entities/user.entity';
import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { TokenServiceInterface, TokenPair } from '../../interfaces/services/token.service.interface';
import { RefreshTokenRepositoryInterface } from '../../interfaces/repositories/refresh-token.repository.interface';
import { SecurityServiceInterface } from '../../interfaces/services/security.service.interface';

export interface RefreshTokenUseCaseInput {
  refreshToken: string;
}

export interface RefreshTokenUseCaseOutput {
  user: User;
  tokens: TokenPair;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
    private readonly tokenService: TokenServiceInterface,
    private readonly securityService: SecurityServiceInterface
  ) {}

  async execute(input: RefreshTokenUseCaseInput): Promise<RefreshTokenUseCaseOutput> {
    try {
      // Verify refresh token
      const payload = this.tokenService.verifyRefreshToken(input.refreshToken);

      // Check for token reuse
      const isTokenReused = await this.securityService.detectTokenReuse(payload.jti);
      if (isTokenReused) {
        await this.securityService.logSecurityEvent(
          'REFRESH_TOKEN_REUSE_DETECTED',
          payload.sub,
          { jti: payload.jti }
        );
        throw new Error('Token reuse detected');
      }

      // Find and validate refresh token
      const tokenRecord = await this.refreshTokenRepository.findByJti(payload.jti);
      if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.isExpired()) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Revoke old refresh token
      await this.refreshTokenRepository.revoke(payload.jti);

      // Generate new tokens
      const tokens = await this.tokenService.generateTokenPair({
        id: user.id,
        email: user.email,
        roles: ['customer'] // TODO: Get actual roles
      });

      return {
        user,
        tokens
      };
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }
}