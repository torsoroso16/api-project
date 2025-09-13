import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TokenService } from '../services/token.service';
import { SecurityService } from '../services/security.service';

@Injectable()
export class AuthCleanupTask {
  private readonly logger = new Logger(AuthCleanupTask.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly securityService: SecurityService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCleanup() {
    this.logger.log('Starting daily auth cleanup...');
    
    try {
      await this.tokenService.cleanupExpiredTokens();
      this.logger.log('Daily cleanup completed successfully');
    } catch (error) {
      this.logger.error('Daily cleanup failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklySecurityCleanup() {
    this.logger.log('Starting weekly security cleanup...');
    
    try {
      await this.securityService.cleanupRevokedTokens();
      this.logger.log('Weekly security cleanup completed successfully');
    } catch (error) {
      this.logger.error('Weekly security cleanup failed:', error);
    }
  }
}