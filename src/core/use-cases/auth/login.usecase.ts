import { User } from '../../entities/user.entity';
import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { PasswordServiceInterface } from '../../interfaces/services/password.service.interface';
import { TokenServiceInterface, TokenPair } from '../../interfaces/services/token.service.interface';

export interface LoginUseCaseInput {
  email: string;
  password: string;
}

export interface LoginUseCaseOutput {
  user: User;
  tokens: TokenPair;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly passwordService: PasswordServiceInterface,
    private readonly tokenService: TokenServiceInterface
  ) {}

  async execute(input: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verify(
      user.passwordHash,
      input.password
    );
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair({
      id: user.id,
      email: user.email,
      roles: ['customer'] // TODO: Get actual roles from user
    });

    return {
      user,
      tokens
    };
  }
}