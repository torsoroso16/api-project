import { Field, ArgsType, ID } from '@nestjs/graphql';
import { CreateProfileInput } from './create-profile.input'; // Use CreateProfileInput instead

@ArgsType()
export class UpdateProfileArgs {
  @Field(() => ID)
  id: number;

  @Field(() => CreateProfileInput)
  input: CreateProfileInput;
}