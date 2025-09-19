export interface SecurityServiceInterface {
  detectTokenReuse(jti: string): Promise<boolean>;
  logSecurityEvent(event: string, userId?: number, details?: Record<string, any>): Promise<void>;
  markTokenAsRevoked(jti: string, ttlSeconds: number): Promise<void>;
}