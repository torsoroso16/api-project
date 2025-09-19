export class RefreshToken {
  constructor(
    public readonly id: number,
    public readonly jti: string,
    public readonly tokenHash: string,
    public readonly userId: number,
    public readonly expiresAt: Date,
    public readonly isRevoked: boolean = false,
    public readonly createdAt?: Date
  ) {}

  static create(data: {
    jti: string;
    tokenHash: string;
    userId: number;
    expiresAt: Date;
  }): RefreshToken {
    return new RefreshToken(
      0,
      data.jti,
      data.tokenHash,
      data.userId,
      data.expiresAt,
      false,
      new Date()
    );
  }

  revoke(): RefreshToken {
    return new RefreshToken(
      this.id,
      this.jti,
      this.tokenHash,
      this.userId,
      this.expiresAt,
      true,
      this.createdAt
    );
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}