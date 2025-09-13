import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class RefreshTokenInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}