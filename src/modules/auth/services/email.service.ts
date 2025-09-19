import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailServiceInterface } from '../../../core/interfaces/services/email.service.interface';

@Injectable()
export class EmailService implements EmailServiceInterface {
  constructor(private readonly configService: ConfigService) {}

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    // Dummy implementation - replace with real email service
    console.log(`
      📧 Email Verification
      To: ${email}
      Subject: Verify your email address
      
      Click the link below to verify your email:
      ${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}
    `);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    // Dummy implementation - replace with real email service
    console.log(`
      📧 Password Reset
      To: ${email}
      Subject: Reset your password
      
      Click the link below to reset your password:
      ${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}
    `);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // Dummy implementation
    console.log(`
      📧 Welcome
      To: ${email}
      Subject: Welcome to our platform!
      
      Hello ${name}, welcome to our platform!
    `);
  }
}