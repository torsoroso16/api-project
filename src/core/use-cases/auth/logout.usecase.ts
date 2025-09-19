import { TokenServiceInterface } from '../../interfaces/services/token.service.interface';
import { RefreshTokenRepositoryInterface } from '../../interfaces/repositories/refresh-token.repository.interface';

export interface LogoutUseCaseInput {
  refreshToken: string;
}

export class LogoutUseCase {
  constructor(
    private readonly tokenService: TokenServiceInterface,
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface
  ) {}

  async execute(input: LogoutUseCaseInput): Promise<void> {
    try {
      const payload = this.tokenService.decodeToken(input.refreshToken);
      if (payload?.jti) {
        await this.refreshTokenRepository.revoke(payload.jti);
      }
    } catch (error) {
      // Always succeed for logout even if token is invalid
    }
  }
}