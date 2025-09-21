import { Module } from '@nestjs/common';
import { StripePaymentService } from './services/stripe-payment.service';
import { PaypalPaymentService } from './services/paypal-payment.service';

@Module({
  providers: [StripePaymentService, PaypalPaymentService],
  exports: [StripePaymentService, PaypalPaymentService],
})
export class PaymentModule {}
