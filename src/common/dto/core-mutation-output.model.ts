import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CoreMutationOutput {
  @Field()
  message: string;

  @Field()
  success: boolean;
}