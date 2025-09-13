import {
  InputType,
  ObjectType,
  PartialType,
  PickType,
  registerEnumType,
  Field,
} from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

// Define Permission enum separately since User entity doesn't have password field exposed
export enum Permission {
  SUPER_ADMIN = 'super_admin',
  STORE_OWNER = 'store_owner',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

registerEnumType(Permission, { name: 'Permission' });

@InputType()
export class RegisterInput {
  @Field()
  @IsString()
  @MaxLength(50)
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}

@InputType()
export class LoginInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  password?: string;
}

@InputType()
export class SocialLoginInput {
  @Field()
  @IsString()
  provider: string;

  @Field()
  @IsString()
  access_token: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  oldPassword: string;

  @Field()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

@InputType()
export class ForgetPasswordInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class UpdateEmailUserInput {
  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class VerifyForgetPasswordTokenInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  token: string;
}

@InputType()
export class ResetPasswordInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  token: string;

  @Field()
  @IsString()
  @MinLength(8)
  password: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  token: string;

  @Field(() => [String])
  permissions: string[];

  @Field({ nullable: true })
  role?: string;
}

@ObjectType()
export class PasswordChangeResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@InputType()
export class VerifyOtpInput {
  @Field()
  @IsString()
  otp_id: string;

  @Field()
  @IsString()
  code: string;

  @Field()
  @IsString()
  phone_number: string;
}

@ObjectType()
export class OtpResponse {
  @Field()
  id: string;

  @Field()
  message: string;

  @Field()
  success: boolean;

  @Field()
  phone_number: string;

  @Field()
  provider: string;

  @Field()
  is_contact_exist: boolean;
}

@InputType()
export class OtpInput {
  @Field()
  @IsString()
  phone_number: string;
}

@InputType()
export class OtpLoginInput {
  @Field()
  @IsString()
  otp_id: string;

  @Field()
  @IsString()
  code: string;

  @Field()
  @IsString()
  phone_number: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;
}