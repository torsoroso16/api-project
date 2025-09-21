import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsNumber, IsString } from 'class-validator';

@ArgsType()
export class GetProductArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;
}