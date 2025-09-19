import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { RefreshTokenRepositoryInterface } from '../../../core/interfaces/repositories/refresh-token.repository.interface';

@Injectable()
export class AuthCleanupTask {
  private readonly logger = new Logger(AuthCleanupTask.name);

  constructor(
    @Inject('RefreshTokenRepositoryInterface')
    private readonly refreshTokenRepository: RefreshTokenRepositoryInterface,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyCleanup() {
    this.logger.log('Starting daily auth cleanup...');
    
    try {
      await this.refreshTokenRepository.deleteExpired();
      this.logger.log('Daily cleanup completed successfully');
    } catch (error) {
      this.logger.error('Daily cleanup failed:', error);
    }
  }
}