export class User {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
    public readonly isEmailVerified: boolean = false,
    public readonly isActive: boolean = true,
    public readonly emailVerificationToken?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  static create(data: {
    email: string;
    name: string;
    passwordHash: string;
    emailVerificationToken?: string;
  }): User {
    return new User(
      0, // Will be set by repository
      data.email,
      data.name,
      data.passwordHash,
      false,
      true,
      data.emailVerificationToken,
      new Date(),
      new Date()
    );
  }

  verifyEmail(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      true,
      this.isActive,
      undefined, // Clear verification token
      this.createdAt,
      new Date()
    );
  }

  deactivate(): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      this.isEmailVerified,
      false,
      this.emailVerificationToken,
      this.createdAt,
      new Date()
    );
  }

  changePassword(newPasswordHash: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      newPasswordHash,
      this.isEmailVerified,
      this.isActive,
      this.emailVerificationToken,
      this.createdAt,
      new Date()
    );
  }
}