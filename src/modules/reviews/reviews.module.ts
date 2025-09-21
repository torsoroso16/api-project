import { Module } from '@nestjs/common';
import { ReviewsService } from './services/reviews.service';
import { ReviewsResolver } from './controllers/reviews.resolver';
import { ReportsResolver } from './controllers/reports.resolver';

@Module({
  providers: [ReviewsResolver, ReviewsService, ReportsResolver],
})
export class ReviewsModule {}
