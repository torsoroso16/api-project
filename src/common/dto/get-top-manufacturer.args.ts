import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, IsString, Min } from 'class-validator';

@ArgsType()
export class GetTopManufacturerArgs {
  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;
}