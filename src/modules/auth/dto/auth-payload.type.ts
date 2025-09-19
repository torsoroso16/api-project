import { ObjectType, Field } from '@nestjs/graphql';
import { UserEntity } from '../entities/user.entity';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => UserEntity)
  user: UserEntity;
}