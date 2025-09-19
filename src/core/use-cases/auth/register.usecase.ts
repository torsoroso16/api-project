import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';
import { UserRepositoryInterface } from '../../interfaces/repositories/user.repository.interface';
import { RoleRepositoryInterface } from '../../interfaces/repositories/role.repository.interface';
import { PasswordServiceInterface } from '../../interfaces/services/password.service.interface';
import { TokenServiceInterface, TokenPair } from '../../interfaces/services/token.service.interface';
import { EmailServiceInterface } from '../../interfaces/services/email.service.interface';

export interface RegisterUseCaseInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUseCaseOutput {
  user: User;
  tokens: TokenPair;
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly roleRepository: RoleRepositoryInterface,
    private readonly passwordService: PasswordServiceInterface,
    private readonly tokenService: TokenServiceInterface,
    private readonly emailService: EmailServiceInterface
  ) {}

  async execute(input: RegisterUseCaseInput): Promise<RegisterUseCaseOutput> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Get default customer role
    const customerRole = await this.roleRepository.findByName('customer');
    if (!customerRole) {
      throw new Error('Default customer role not found');
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(input.password);

    // Generate verification token
    const emailVerificationToken = this.generateVerificationToken();

    // Create user
    const newUser = User.create({
      email: input.email,
      name: input.name,
      passwordHash,
      emailVerificationToken
    });

    const savedUser = await this.userRepository.create(newUser);

    // Generate tokens
    const tokens = await this.tokenService.generateTokenPair({
      id: savedUser.id,
      email: savedUser.email,
      roles: ['customer']
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      emailVerificationToken
    );

    return {
      user: savedUser,
      tokens
    };
  }

  private generateVerificationToken(): string {
    return require('uuid').v4();
  }
}