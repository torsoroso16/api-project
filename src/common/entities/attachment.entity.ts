import { ObjectType, InputType, ID, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber } from 'class-validator';

@InputType('AttachmentInput', { isAbstract: true })
@ObjectType()
export class Attachment {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsNumber()
  id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  original?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fileName?: string;
}