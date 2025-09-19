import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, IsNumber, ValidateNested, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProfileInput } from './create-profile.input';

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  @IsNumber()
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => CreateProfileInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateProfileInput)
  profile?: CreateProfileInput;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleNames?: string[];
}