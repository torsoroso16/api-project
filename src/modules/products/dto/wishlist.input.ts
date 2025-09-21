import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class CreateWishlistInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsNumber()
  productId: number;
}