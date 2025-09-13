import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Type } from 'class-transformer';

@ObjectType({ isAbstract: true })
export class CoreEntity {
  @Field(() => ID)
  id: number;

  @Field()
  @Type(() => Date)
  createdAt: Date;

  @Field()
  @Type(() => Date)
  updatedAt: Date;
}
