export const AUTH_CONSTANTS = {
  REFRESH_TOKEN_COOKIE_NAME: 'refreshToken',
  REFRESH_TOKEN_REDIS_PREFIX: 'refresh_token:',
  REVOKED_TOKEN_REDIS_PREFIX: 'revoked_token:',
  EMAIL_VERIFICATION_TOKEN_PREFIX: 'email_verification:',
  PASSWORD_RESET_TOKEN_PREFIX: 'password_reset:',
  TOKEN_EXPIRY: {
    ACCESS_TOKEN: '10m',
    REFRESH_TOKEN: '30d',
    EMAIL_VERIFICATION: '24h',
    PASSWORD_RESET: '1h',
  },
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  },
};