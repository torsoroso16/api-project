import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class MakeOrRevokeAdminInput {
  @Field(() => ID)
  @IsNumber()
  user_id: number;
}