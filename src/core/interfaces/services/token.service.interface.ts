export interface JwtPayload {
  sub: number;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: number;
  jti: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface TokenServiceInterface {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: JwtRefreshPayload): Promise<string>;
  generateTokenPair(user: { id: number; email: string; roles: string[] }): Promise<TokenPair>;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtRefreshPayload;
  decodeToken(token: string): any;
}