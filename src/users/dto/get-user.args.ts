import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@ArgsType()
export class GetUserArgs {
  @IsNotEmpty()
  @IsNumber()
  @Field(() => ID)
  id: number;
}