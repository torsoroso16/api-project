import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber } from 'class-validator';

@ArgsType()
export class CoreGetArguments {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  slug?: string;
}