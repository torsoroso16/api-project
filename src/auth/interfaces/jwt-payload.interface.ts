export interface JwtPayload {
  sub: number; // user id
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface JwtRefreshPayload {
  sub: number; // user id
  jti: string; // JWT ID for token tracking
  iat?: number;
  exp?: number;
}
