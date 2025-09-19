import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PasswordServiceInterface } from '../../../core/interfaces/services/password.service.interface';

@Injectable()
export class PasswordService implements PasswordServiceInterface {
  async hash(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  async verify(hashedPassword: string, plainPassword: string): Promise<boolean> {
    return await argon2.verify(hashedPassword, plainPassword);
  }
}