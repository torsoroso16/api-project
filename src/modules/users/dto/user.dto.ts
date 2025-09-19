import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('User')
export class UserDto {
  @Field(() => ID)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  isEmailVerified: boolean;

  @Field()
  isActive: boolean;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
